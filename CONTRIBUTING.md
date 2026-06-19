# Contributing to BREACH // PROTOCOL

Thanks for helping make this a better study tool! Contributions of all kinds are
welcome — bug fixes, UI improvements, and especially **question quality**.

## 🚨 The golden rule

**Never submit real, leaked, or remembered exam questions.**

Every question in this project must be **original study material** derived from
the publicly published [exam objectives](https://www.comptia.org/). Submitting
actual certification questions ("brain dumps") violates CompTIA policy, can get
candidates banned, and will be rejected immediately. When in doubt, write from
the objective, not from memory of a test.

## Ways to contribute

### Fix or improve a question
1. Find the question in [`data/questions-master.json`](data/questions-master.json)
2. Edit the relevant field (typo, wrong answer, weak explanation, length tell)
3. Open a PR describing what you changed and why

### Add new questions
Follow the exact JSON schema below. Each question is one object:

```json
{
  "id": 645,
  "domain": 2,
  "objective": "Attacks: Prompt injection",
  "question": "A security analyst notices an LLM-backed support bot...",
  "options": [
    "Apply a prompt firewall to filter inputs before they reach the model",
    "Increase the model's temperature setting",
    "Disable logging to reduce attack surface",
    "Switch to a larger model"
  ],
  "answer": "A",
  "explanation": "A prompt firewall inspects and filters incoming prompts before they reach the model, blocking injection payloads. Temperature, logging, and model size do not address injection."
}
```

**Field rules:**
- `domain`: integer 1–4
- `objective`: must match an entry in [`data/objectives.json`](data/objectives.json) exactly
- `options`: exactly 4 strings
- `answer`: one of `"A"`, `"B"`, `"C"`, `"D"`
- `explanation`: explain *why the right answer is right and why the others are wrong*

### Quality checklist (we run this on PRs)
- [ ] No verbatim or near-verbatim real exam questions
- [ ] Answer-length is balanced — the correct option isn't always the longest/shortest (avoids "test-taking tells")
- [ ] Distractors are plausible, not obviously wrong
- [ ] The objective string matches the official list exactly
- [ ] Explanation teaches, doesn't just restate the answer

## Code contributions

The app is currently a single `index.html`. Keep changes focused and test on
mobile (iOS Safari especially). A modular refactor (Vite + ES modules) is on the
roadmap — if you'd like to help with that, open an issue first to coordinate.

## Reporting issues

Found a wrong answer, a bug, or a question that feels too close to the real
exam? [Open an issue](../../issues) — content concerns are taken seriously and
reviewed quickly.
