"""
Kafka Producer Poller

Polls the Event Generator API and produces events to Kafka

Architecture:
    API Generator (http://localhost:7070/gen/event) 
    → Producer Poller (this script)
    → Kafka (topic: events_raw)
"""

import json
import time
import logging
from datetime import datetime
import os
from typing import Optional, Dict, Any

import requests
from kafka import KafkaProducer
from kafka.errors import KafkaError

# ============================================================================
# CONFIGURATION
# ============================================================================

# API Configuration
API_URL = os.getenv('API_URL', 'http://localhost:7070/gen/event')
API_TIMEOUT = int(os.getenv('API_TIMEOUT', '5'))  # seconds

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'events_raw')

# Polling Configuration
POLL_INTERVAL_MS = int(os.getenv('POLL_INTERVAL_MS', '500'))  # 500ms = 2 events/sec
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
RETRY_DELAY_SEC = int(os.getenv('RETRY_DELAY_SEC', '2'))

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ============================================================================
# KAFKA PRODUCER SETUP
# ============================================================================

def create_kafka_producer() -> Optional[KafkaProducer]:
    """
    Create and return a Kafka Producer instance
    
    Returns:
        KafkaProducer or None if connection fails
    """
    try:
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',  # Wait for all replicas
            retries=3,
            max_in_flight_requests_per_connection=1  # Ensure ordering
        )
        logger.info(f"✅ Connected to Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
        return producer
    except KafkaError as e:
        logger.error(f"❌ Failed to connect to Kafka: {e}")
        return None

# ============================================================================
# API POLLING
# ============================================================================

def poll_event_from_api(retry_count: int = 0) -> Optional[Dict[str, Any]]:
    """
    Poll a single event from the API Generator
    
    Args:
        retry_count: Current retry attempt number
        
    Returns:
        Event dict or None if failed
    """
    try:
        response = requests.get(API_URL, timeout=API_TIMEOUT)
        response.raise_for_status()
        
        event = response.json()
        logger.info(f"📥 Pulled event from API: {event.get('eventType')} | Order: {event.get('orderId')}")
        return event
        
    except requests.exceptions.Timeout:
        logger.warning(f"⏱️ API timeout (attempt {retry_count + 1}/{MAX_RETRIES})")
        return retry_poll(retry_count)
        
    except requests.exceptions.ConnectionError:
        logger.warning(f"🔌 API connection error (attempt {retry_count + 1}/{MAX_RETRIES})")
        return retry_poll(retry_count)
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"❌ API HTTP error: {e.response.status_code} - {e.response.text}")
        return retry_poll(retry_count)
        
    except json.JSONDecodeError:
        logger.error(f"❌ Invalid JSON response from API")
        return None
        
    except Exception as e:
        logger.error(f"❌ Unexpected error polling API: {e}")
        return None

def retry_poll(retry_count: int) -> Optional[Dict[str, Any]]:
    """
    Retry polling with exponential backoff
    
    Args:
        retry_count: Current retry attempt
        
    Returns:
        Event dict or None if max retries exceeded
    """
    if retry_count < MAX_RETRIES:
        time.sleep(RETRY_DELAY_SEC * (retry_count + 1))
        return poll_event_from_api(retry_count + 1)
    else:
        logger.error(f"❌ Max retries ({MAX_RETRIES}) exceeded")
        return None

# ============================================================================
# KAFKA PRODUCTION
# ============================================================================

def produce_to_kafka(producer: KafkaProducer, event: Dict[str, Any]) -> bool:
    """
    Send event to Kafka topic
    
    Args:
        producer: Kafka Producer instance
        event: Event dictionary
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Use orderId as message key for partitioning
        key = event.get('orderId', '')
        
        # Send to Kafka
        future = producer.send(KAFKA_TOPIC, key=key, value=event)
        
        # Wait for acknowledgment (with timeout)
        record_metadata = future.get(timeout=10)
        
        logger.info(
            f"📤 Produced to Kafka: topic={record_metadata.topic} | "
            f"partition={record_metadata.partition} | offset={record_metadata.offset} | "
            f"eventType={event.get('eventType')} | orderId={event.get('orderId')}"
        )
        return True
        
    except KafkaError as e:
        logger.error(f"❌ Kafka production error: {e}")
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected error producing to Kafka: {e}")
        return False

# ============================================================================
# MAIN POLLING LOOP
# ============================================================================

def main():
    """
    Main polling loop: API → Kafka
    """
    logger.info("=" * 70)
    logger.info("🚀 Kafka Producer Poller Starting...")
    logger.info("=" * 70)
    logger.info(f"API URL: {API_URL}")
    logger.info(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    logger.info(f"Topic: {KAFKA_TOPIC}")
    logger.info(f"Poll Interval: {POLL_INTERVAL_MS}ms")
    logger.info("=" * 70)
    
    # Create Kafka Producer
    producer = create_kafka_producer()
    if not producer:
        logger.error("❌ Cannot start without Kafka connection. Exiting.")
        return
    
    # Statistics
    total_pulled = 0
    total_produced = 0
    total_failed = 0
    
    try:
        while True:
            start_time = time.time()
            
            # Step 1: Poll event from API
            event = poll_event_from_api()
            
            if event:
                total_pulled += 1
                
                # Step 2: Produce to Kafka
                success = produce_to_kafka(producer, event)
                
                if success:
                    total_produced += 1
                else:
                    total_failed += 1
            else:
                total_failed += 1
                logger.warning("⚠️ Skipping this cycle due to API failure")
            
            # Log statistics every 20 events
            if (total_pulled + total_failed) % 20 == 0:
                logger.info(
                    f"📊 Stats: Pulled={total_pulled} | Produced={total_produced} | Failed={total_failed}"
                )
            
            # Sleep to maintain polling interval
            elapsed_ms = (time.time() - start_time) * 1000
            sleep_ms = max(0, POLL_INTERVAL_MS - elapsed_ms)
            time.sleep(sleep_ms / 1000)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Shutting down gracefully...")
        logger.info(f"📊 Final Stats: Pulled={total_pulled} | Produced={total_produced} | Failed={total_failed}")
        producer.close()
        logger.info("✅ Producer closed. Goodbye!")

if __name__ == "__main__":
    main()
