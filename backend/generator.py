#!/usr/bin/env python3
"""
Event Generator for E-commerce Realtime Pipeline
Generates fake e-commerce events and sends them to Kafka topic 'events_raw'
"""

import json
import uuid
import random
import time
from datetime import datetime, timezone
from typing import Dict
from kafka import KafkaProducer
from kafka.errors import KafkaError

# ============================================================================
# CONFIGURATION
# ============================================================================
KAFKA_BOOTSTRAP_SERVERS = ['localhost:9092']
KAFKA_TOPIC = 'events_raw'
EVENTS_PER_SECOND = 5  # Adjust this to control event rate
CURRENCIES = ['VND', 'USD']

# Event type distribution (weighted random)
EVENT_TYPES = [
    ('order_created', 30),
    ('payment_initiated', 25),
    ('payment_success', 20),
    ('payment_failed', 5),
    ('order_cancelled', 20),
]

# Status distribution
STATUSES = [
    ('success', 70),
    ('pending', 20),
    ('failed', 10),
]

# ============================================================================
# EVENT GENERATOR
# ============================================================================

def weighted_choice(choices):
    """Select from weighted list: [(item, weight), ...]"""
    total = sum(w for c, w in choices)
    r = random.uniform(0, total)
    upto = 0
    for c, w in choices:
        if upto + w >= r:
            return c
        upto += w
    return choices[-1][0]


def generate_event() -> Dict:
    """Generate a single e-commerce event"""
    event = {
        'id': str(uuid.uuid4()),
        'eventTime': datetime.now(timezone.utc).isoformat(),
        'eventType': weighted_choice(EVENT_TYPES),
        'orderId': f'ORD{random.randint(100000, 999999)}',
        'userId': f'USR{random.randint(1000, 9999)}',
        'amount': round(random.uniform(100000, 5000000), 2),  # VND range
        'currency': random.choice(CURRENCIES),
        'status': weighted_choice(STATUSES),
    }
    
    # Occasionally add invalid events for testing (1% chance)
    if random.random() < 0.01:
        # Missing required field
        if random.random() < 0.5:
            del event['orderId']
        # Negative amount
        else:
            event['amount'] = -random.uniform(100, 1000)
    
    return event


def delivery_report(err, msg):
    """Kafka delivery callback"""
    if err is not None:
        print(f'❌ Delivery failed: {err}')
    else:
        print(f'✅ Event delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}')


def create_kafka_producer() -> KafkaProducer:
    """Create Kafka producer with JSON serialization"""
    try:
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',  # Wait for all replicas
            retries=3,
            max_in_flight_requests_per_connection=1,  # Ensure ordering
        )
        print(f'✅ Kafka producer connected to {KAFKA_BOOTSTRAP_SERVERS}')
        return producer
    except KafkaError as e:
        print(f'❌ Failed to create Kafka producer: {e}')
        raise


def main():
    """Main event generator loop"""
    print('=' * 70)
    print('🚀 E-COMMERCE EVENT GENERATOR')
    print('=' * 70)
    print(f'📡 Kafka: {KAFKA_BOOTSTRAP_SERVERS}')
    print(f'📝 Topic: {KAFKA_TOPIC}')
    print(f'⚡ Rate: {EVENTS_PER_SECOND} events/second')
    print('=' * 70)
    print()
    
    producer = create_kafka_producer()
    
    event_count = 0
    sleep_interval = 1.0 / EVENTS_PER_SECOND
    
    try:
        print('🟢 Starting event generation... (Press Ctrl+C to stop)')
        print()
        
        while True:
            event = generate_event()
            
            # Send to Kafka
            try:
                future = producer.send(KAFKA_TOPIC, value=event)
                # Block until sent (for debugging)
                record_metadata = future.get(timeout=10)
                
                event_count += 1
                
                # Print progress every 10 events
                if event_count % 10 == 0:
                    print(f'📊 Sent {event_count} events | Last: {event["eventType"]} | Order: {event["orderId"]} | Amount: {event["amount"]:.2f} {event["currency"]}')
            
            except KafkaError as e:
                print(f'❌ Failed to send event: {e}')
            
            time.sleep(sleep_interval)
    
    except KeyboardInterrupt:
        print()
        print('=' * 70)
        print(f'🛑 Stopping generator... Total events sent: {event_count}')
        print('=' * 70)
    
    finally:
        producer.flush()
        producer.close()
        print('✅ Kafka producer closed')


if __name__ == '__main__':
    main()
