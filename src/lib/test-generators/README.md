# Randomized Input Generators for Cafeteria System Testing

## 📋 Overview

These generators produce realistic, randomized test data for the cafeteria ordering system. They support property-based testing, edge cases, invalid inputs, and large datasets - all **locally without database writes**.

## Quick Start

### Run the Generators

```bash
# Generate sample data (5 items each)
npm run generate:test-data

# Generate large batch (1000 items)
npm run generate:test-data:batch

# Generate edge cases only
npm run generate:test-data:edge

# Run performance benchmarks
npm run benchmark:generators
