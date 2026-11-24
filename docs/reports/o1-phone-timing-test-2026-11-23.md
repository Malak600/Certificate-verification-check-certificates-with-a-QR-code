# O1 phone timing test — 23 Nov 2026

**Objective O1:** a verifier can check one certificate in under 10 seconds.

**Tested by:** Malak Alfakavi
**Device:** phone, over **Wi-Fi** (no mobile data available; to be repeated on mobile data at the club trial)
**Certificate:** real certificate from the 20 Nov Sepolia batch (status Valid)
**Link:** [verify.html?hash=0xcfda…37f0](https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html?hash=0xcfda8e63ad22ab2fae9a8d74f5c80d7d0c182e86d6b13fa38fbc5ad9364c37f0) (same link as the QR code)
**Method:** stopwatch on the laptop, started when the link was opened on the phone and stopped when "✅ Valid" appeared. The tab was closed before each try.

## Results (seconds)

| Try | Browser | Time (s) |
|---|---|---|
| 1 | WhatsApp in-app browser, first visit | 11.46 |
| 2 | Chrome | 1.29 |
| 3 | Chrome | 0.95 |
| 4 | Chrome | 0.61 |
| 5 | Chrome | 0.61 |
| 6 | Chrome | 0.90 |
| 7 | Chrome | 0.58 |
| 8 | Chrome | 0.41 |
| 9 | Chrome | 0.29 |
| 10 | Chrome | 0.20 |
| 11 | Chrome incognito (first visit, nothing cached) | 0.83 |
| 12 | Chrome incognito (first visit, nothing cached) | 0.52 |
| 13 | Chrome incognito (first visit, nothing cached) | 0.31 |

## Summary

- **Chrome (tries 2–10): median 0.61 s**
- **Chrome incognito, first visit: 0.31–0.83 s**
- **WhatsApp in-app browser, first visit: 11.46 s** (slower than the target)
- **O1 target (under 10 s) is met in Chrome ✅**

## Open points

- Repeat the test on **mobile data** during the December club trial.
- The WhatsApp in-app browser was much slower on the first visit; verifiers should open the link in their normal browser.
