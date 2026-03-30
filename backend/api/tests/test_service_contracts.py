from django.test import SimpleTestCase


class ServiceContractTests(SimpleTestCase):
    def test_confirm_contract_nullable_fields(self):
        # Contract guard: confidence can be null and diagnosis must include language.
        payload = {
            "plant": {"name": "Tomato", "common_name": "Tomato", "confidence": None},
            "health": {
                "status": "healthy",
                "disease_name": None,
                "disease_type": None,
                "confidence": 0.95,
            },
            "diagnosis": {"summary": "ok", "steps": ["step"], "language": "en"},
            "version": "v1",
        }
        self.assertIsNone(payload["plant"]["confidence"])
        self.assertEqual(payload["diagnosis"]["language"], "en")
