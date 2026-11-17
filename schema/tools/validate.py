"""Real SHACL check (objective O4) for CertiChain certificates.

Validates every certificate JSON in a folder against schema/certificate-shape.ttl
with pySHACL, then runs negative tests to prove the shape really rejects broken
certificates. Exits with code 1 on any failure.

Usage (from the repo root):
    pip install pyshacl
    python schema/tools/validate.py <folder-with-certificate-json>

The certificate's own @context lists remote URLs (W3C VC v2 and the PROV-O
namespace). The PROV namespace is not a JSON-LD context document, so the
certificate is expanded here with schema/context.jsonld, which maps every
field to the same IRIs offline. The hash is never affected: it is computed
on the certificate JSON exactly as issued (see HASHING.md).
"""
import copy
import json
import sys
from pathlib import Path

import logging

from pyshacl import validate
from rdflib import Graph

logging.getLogger("rdflib").setLevel(logging.CRITICAL)  # quiet the expected "bad date" warning

ROOT = Path(__file__).resolve().parents[2]
CONTEXT = json.loads((ROOT / "schema" / "context.jsonld").read_text(encoding="utf-8"))["@context"]
SHAPES = Graph().parse(ROOT / "schema" / "certificate-shape.ttl", format="turtle")


def check(cert):
    doc = copy.deepcopy(cert)
    doc["@context"] = CONTEXT
    data = Graph().parse(data=json.dumps(doc), format="json-ld")
    conforms, _, text = validate(data, shacl_graph=SHAPES)
    return conforms, text


def main(folder):
    files = sorted(Path(folder).glob("*.json"))
    if not files:
        print(f"No certificate JSON files found in {folder}")
        return 1

    passed = 0
    for f in files:
        conforms, text = check(json.loads(f.read_text(encoding="utf-8")))
        if conforms:
            passed += 1
        else:
            print(f"FAIL {f.name}\n{text}")
    rate = 100 * passed / len(files)
    print(f"O4 SHACL conformance: {passed}/{len(files)} = {rate:.1f}%")

    # Negative tests: each broken certificate MUST be rejected.
    base = json.loads(files[0].read_text(encoding="utf-8"))
    broken = {
        "missing recipientName": lambda c: c["credentialSubject"].pop("recipientName"),
        "missing eventTitle": lambda c: c["credentialSubject"].pop("eventTitle"),
        "bad eventDate": lambda c: c["credentialSubject"].__setitem__("eventDate", "5 December"),
        "missing salt": lambda c: c.pop("salt"),
        "short salt": lambda c: c.__setitem__("salt", "abc123"),
        "missing issuer": lambda c: c.pop("issuer"),
        "issuer not a Sepolia did": lambda c: c["issuer"].__setitem__("id", "https://example.org/club"),
        "attributedTo differs from issuer": lambda c: c["wasAttributedTo"].__setitem__(
            "id", "did:pkh:eip155:11155111:0x0000000000000000000000000000000000000001"),
        "missing validFrom": lambda c: c.pop("validFrom"),
        "not a VerifiableCredential": lambda c: c.__setitem__("type", ["ParticipationCertificate"]),
    }
    negative_ok = 0
    for label, breaker in broken.items():
        cert = copy.deepcopy(base)
        breaker(cert)
        conforms, _ = check(cert)
        if conforms:
            print(f"FAIL negative test '{label}': broken certificate was accepted")
        else:
            negative_ok += 1
    print(f"Negative tests: {negative_ok}/{len(broken)} broken certificates rejected")

    return 0 if passed == len(files) and negative_ok == len(broken) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "schema-samples"))
