from django.test import SimpleTestCase

from api.services.diagnosis import build_claude_prompt


class DiagnosisPromptTests(SimpleTestCase):
    def test_build_claude_prompt_healthy_branch(self):
        p = build_claude_prompt(
            "Tomato",
            {
                "status": "healthy",
                "disease_name": None,
                "disease_type": None,
                "confidence": 0.9,
            },
        )
        self.assertIn("reported as healthy", p)
        self.assertIn("smallholder farmer", p)

    def test_build_claude_prompt_issue_branch(self):
        p = build_claude_prompt(
            "Tomato",
            {
                "status": "infected",
                "disease_name": "Late blight",
                "disease_type": "fungal",
                "confidence": 0.8,
            },
        )
        self.assertIn("health issue", p)
        self.assertIn("Late blight", p)
