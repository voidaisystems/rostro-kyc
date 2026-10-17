# Aman (أمان) - Technical Engineering & Implementation Plan
*(Production-Hardened & Regulatory-Compliant Engineering Roadmap)*

## 1. Executive Summary
This document details the production engineering implementation roadmap for deploying the **Aman** Anti-Fraud Platform within Iraqi digital wallets (ZainCash, Qi Card). It addresses high-load scalability, Central Bank compliance, mobile store privacy policies (App Store & Google Play), and defense against adversarial poisoning.

---

## 2. Technology Stack & Infrastructure

| Layer | Technology | Key Responsibility | Latency SLA |
| :--- | :--- | :--- | :--- |
| **Mobile SDK** | Kotlin (Android) / Swift (iOS) / Flutter | App lifecycle, clipboard latency, and dwell time monitoring | Client-side (< 5ms) |
| **API Gateway** | Kong / FastAPI | Rate limiting, authentication, payload normalization | < 15ms |
| **Real-time Feature Store** | **Redis Enterprise** | Customer 90-day baselines & pre-computed mule graph scores | < 4ms |
| **Streaming Graph Worker** | **Apache Flink** / Celery + Neo4j | Asynchronous background graph analysis of mule networks | Background (Streamed) |
| **Threat Vector DB (RAG)** | **Qdrant** / pgvector | Semantic indexing of verified Iraqi scam scripts & dialect data | < 25ms |
| **Agentic LLM Orchestrator** | **LangGraph** / Async Python | Multi-step reasoning with a strict 1,200ms circuit breaker | < 600ms |
| **Event Stream** | **Apache Kafka** / RabbitMQ | Ingestion of transfer events, disputes, and telemetry | Asynchronous |
| **Analyst Workbench** | React + FastAPI | Human-in-the-Loop (HITL) interface for reviewing scam vector updates | Internal Portal |

---

## 3. The 5 Core Engineering Components

### Component 1: Mobile Telemetry SDK (Store-Compliant Sensors)
To guarantee 100% compliance with Apple App Store and Google Play privacy policies:
- **Zero Telephony Permissions**: Avoids intrusive `READ_PHONE_STATE` or VoIP CallKit entitlements that cause app rejections.
- **App-Switch Lifecycle Tracker**: Hooks into standard app lifecycle events (`onPause`, `onResume`) to detect rapid cycling between messaging apps (WhatsApp/Telegram) and ZainCash within 30 seconds.
- **Clipboard & Typing Dynamics**: Detects if recipient data was pasted within 500ms of screen launch, and measures touch cadence/hesitation on the confirmation button.

### Component 2: Stream-Processed Recipient Graph & Real-Time Cache
To prevent database locks during peak Iraqi salary payout days (thousands of TPS):
- **No Synchronous Graph Traversals**: The system **never** performs heavy multi-hop graph queries inside the checkout path.
- **Background Stream Processing**: Apache Flink monitors the transfer event stream and continuously calculates network topology:
  - Account age $< 72\text{ hours}$.
  - In-degree velocity across multiple governorates.
  - Cash-out velocity at physical agent kiosks.
- **Redis Cache Sink**: Pre-computed mule scores are written directly to Redis. When a user initiates a transfer, the API gateway retrieves the recipient's graph score in **under 4ms**.

### Component 3: Deterministic Risk Engine (Layer 1 Microservice)
- Evaluates telemetry, baseline deviations, and pre-computed mule scores.
- **Early-Exit Bypass**: If Risk Score $< 35$, the transaction passes immediately. The LLM is bypassed completely, saving API costs and maintaining zero latency for 90%+ of normal users.

### Component 4: Agentic Dialect Engine & Circuit Breaker (Layer 2)
- **RAG Retrieval**: Qdrant retrieves verified active Iraqi scam scripts matching the transfer context.
- **Dialect Generation**: System prompt drives natural Iraqi Arabic (`ar-IQ`) and predictive coaching.
- **Hard Latency Circuit Breaker (1,200ms)**: An async watchdog kills the LLM request if inference exceeds 1.2 seconds, seamlessly returning a pre-compiled static Arabic warning. The user never experiences an app freeze.

### Component 5: Human-in-the-Loop (HITL) Continuous Learning
To protect the banking system from **Adversarial Poisoning** (scammers submitting fake data to corrupt model intelligence):
1. **Event Ingestion**: Customer disputes and transaction override logs flow into Kafka.
2. **AI Clustering**: An offline LLM worker clusters emerging scam keywords and identifies new mule clusters.
3. **Analyst Sign-off (HITL)**: Before any new scam vector or rule goes live, a ZainCash Fraud Analyst reviews and approves it on the **Fraud Workbench Dashboard** with one click.
4. **Zero-Downtime Hot Reload**: Approved vectors are hot-reloaded into Qdrant for immediate live protection.

---

## 4. End-to-End Request Lifecycle (< 1.2 Seconds)

```
[0.0s] User taps "Review Transfer" on Mobile App
  │
[0.1s] Mobile SDK bundles intent + non-invasive telemetry (app-switch count, clipboard speed)
  │
[0.15s] Gateway queries Redis: fetches Customer Baseline DNA & Pre-computed Recipient Mule Score (< 4ms)
  │
[0.2s] Layer 1 Engine computes Risk Score: 84 / 100 (HIGH RISK - Matches Mule Velocity + App Switching)
  │
[0.25s] Layer 2 Agent queries Qdrant for active matching scam scripts
  │
[0.55s] Fast LLM generates Iraqi dialect coaching predicting scammer's exact next move
  │
[0.95s] Mobile App receives response and displays the Dialect Bottom-Sheet
```

---

## 5. Production Rollout & Business Safeguards

1. **Conversion Protection**: High-friction cooling-off timers ($3\text{ min}$) are strictly restricted to critical risk scores ($> 85$). Normal and medium transactions retain smooth checkout flow to avoid cart abandonment.
2. **Shadow Mode Deployment (Month 1)**: System runs silently on 100% of live traffic. Outputs are audited against actual fraud dispute cases to calibrate precision before enabling user-facing UI.
3. **Phased Rollout (Month 2–3)**: 5% pilot rollout to new wallets, followed by full network activation.
