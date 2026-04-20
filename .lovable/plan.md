
The user is moving operations into GoHighLevel and wants Perplexity Comet (agentic browser) to build out the workflows + AI agents. They need a copy-paste-ready SOP/prompt artifact that Comet can execute against GHL's UI.

This is a documentation/artifact task — generate one comprehensive markdown file. No code changes. I have full context from CLAUDE.md, memory files (especially `ghl-payload-standard.md`, `ghl-agent-studio-ecosystem`, `lead-scoring-buckets`, `voice-concierge-persona`, `ai-calendar-booking`, `native-booking-system`), and the screenshot showing GHL Agent Studio is empty (10 agent slots available, payment method missing — flag this).

What the artifact must contain:

**Part A — Pre-flight (resolve blockers):** Add payment method, confirm webhook URL matches `GHL_WEBHOOK_URL` env, confirm calendar ID `N7himS3BLf5KxaVbQPz6` is live, set timezone to America/Phoenix.

**Part B — Custom Fields (the contract).** Hub already POSTs ~30 `selena_*` fields via notify-handoff. Comet must create every field with exact API name + type. Source of truth: `notify-handoff/index.ts` payload + `ghl-payload-standard.md`. Include: selena_lead_id, selena_session_id, selena_intent_canonical, selena_score, selena_readiness_score, selena_journey_state, selena_journey_depth, selena_tools_completed, selena_guide_count, selena_timeframe_clean, selena_estimated_value_raw, selena_budget_clean, selena_language_clean, selena_booking_readiness, selena_friction_score, selena_primary_priority, selena_seller_path, selena_is_preapproved (NOT _pre_approved — this is a known quirk), selena_last_sync_trigger, selena_last_sync_detail, selena_last_data_parse_date, selena_dossier_json, selena_summary, etc.

**Part C — Tags taxonomy.** Pre-create all tags emitted by `deriveBehaviorTags`: selena_os_lead, selena_buyer_lead, selena_seller_lead, selena_cash_lead, selena_dual_lead, score_hot/warm/cold, selena_high_intent, selena_multi_tool_user, selena_guide_reader, selena_high_friction, selena_booking_overdue, selena_booking_ready, selena_booked, selena_path_*, selena_journey_ready/engaged, selena_language_es, selena_returning_visitor, selena_tool_*, "selena - intake completed", "selena - website lead", "cc | entry |webhook".

**Part D — Pipelines.** Two pipelines: Buyer Journey + Seller Journey. Stages map to lead score + journey_state. Bilingual handling.

**Part E — The 12 Workflows (numbered WF-01 through WF-12).** Each workflow gets: trigger, filters, step-by-step Comet actions, AI agent prompt if applicable. Cover: inbound webhook intake → tag/score routing, hot lead 5-min call alert (Kasandra SMS), warm lead 7-touch nurture, cold lead long-term nurture, ES-language branch (Spanish nurture), booking confirmation + reminder cascade, no-show recovery, post-booking handoff dossier, returning visitor re-engagement, cash-path expedited follow-up, seller_booking_overdue rescue, calendar invite for /book (calendar ID handoff).

**Part F — AI Agents (10 slots available per screenshot).** Build: (1) Lead Qualifier Agent, (2) Inbound Voice Concierge (matches `voice-concierge-persona` mem — equity protection framing, 'usted', books strategy session), (3) SMS Reply Agent EN, (4) SMS Reply Agent ES, (5) Email Concierge, (6) No-show Recovery Agent, (7) Returning Visitor Agent, (8) Booking Reminder Agent, (9) Cash Path Specialist, (10) Seller Decision Coach. Each agent gets: knowledge base (paste KB-0/KB-6/KB-7.1 brevity rules), system prompt anchored on Selena persona memory, calendar tool binding, escalation rules (defer to Kasandra, never give legal/financial advice).

**Part G — Brand & compliance guardrails for every agent prompt:** non-advisory, defer to Kasandra, no "we"/"our team", 'tú' for Selena chat / 'usted' for voice, never discuss crime/demographics, must include Corner Connect | Realty Executives in any signature, Strategy Session not Free Consultation.

**Part H — Comet operating instructions:** identity as senior RevOps engineer, login flow, screenshot after each major step, confirm before delete, validation checklist after each workflow build (test trigger with dummy contact), output format = build log per workflow.

**Part I — Test plan.** End-to-end smoke tests Comet should run (POST a fake hot/warm/cold lead via webhook URL, verify tag → pipeline stage → AI response → calendar invite).

Length target: ~700 lines. Save to `/mnt/documents/ghl-comet-build-sop.md`.

This is a one-shot artifact generation. Approve and I'll write the file.
