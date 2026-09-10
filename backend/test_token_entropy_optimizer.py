#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unit and Integration Tests for Token Entropy Optimizer
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, r"C:\02_QUILLAN\09 - Projects\projects\oni")
from token_entropy_optimizer import TokenEntropyOptimizer, CompressionResult, CacheablePayload


class TestTokenEntropyOptimizer(unittest.TestCase):
    def setUp(self):
        self.optimizer = TokenEntropyOptimizer(target_ratio=0.50, min_prefix_bytes=100)

    def test_empty_string(self):
        res = self.optimizer.compress_prompt("")
        self.assertEqual(res.compressed_text, "")
        self.assertEqual(res.estimated_tokens_saved, 0)

    def test_conversational_filler_pruning(self):
        verbose_prompt = (
            "Please kindly note that in order to perform an analysis of this system, "
            "I would like you to make sure you check the database logs at the present time."
        )
        res = self.optimizer.compress_prompt(verbose_prompt)
        # Verify filler removal
        self.assertNotIn("Please kindly note that", res.compressed_text)
        self.assertNotIn("I would like you to", res.compressed_text)
        self.assertIn("analyze", res.compressed_text)
        self.assertIn("ensure", res.compressed_text)
        self.assertLess(res.compressed_char_count, res.original_char_count)
        self.assertGreater(res.effective_density_gain, 1.0)

    def test_code_block_preservation(self):
        prompt_with_code = (
            "Could you please review this code:\n"
            "```python\n"
            "def calculate(x):\n"
            "    # please do not change\n"
            "    return x * 2\n"
            "```\n"
            "Moreover, make sure you optimize it."
        )
        res = self.optimizer.compress_prompt(prompt_with_code, preserve_code=True)
        # Code block must remain 100% intact
        self.assertIn("def calculate(x):", res.compressed_text)
        self.assertIn("# please do not change", res.compressed_text)
        self.assertIn("return x * 2", res.compressed_text)
        self.assertIn("ensure", res.compressed_text)

    def test_json_to_dense_schema(self):
        data = [
            {"id": 1, "name": "ASTRA", "role": "Vision"},
            {"id": 2, "name": "LOGOS", "role": "Logic"},
            {"id": 3, "name": "VIR", "role": "Ethics"},
        ]
        dense = self.optimizer.json_to_dense_schema(data)
        lines = dense.split("\n")
        self.assertEqual(lines[0], "id|name|role")
        self.assertEqual(lines[1], "1|ASTRA|Vision")
        self.assertEqual(lines[2], "2|LOGOS|Logic")
        self.assertEqual(lines[3], "3|VIR|Ethics")
        # Token density test: dense must be shorter than raw json
        raw_json = str(data)
        self.assertLess(len(dense), len(raw_json))

    def test_cacheable_prefix_generation(self):
        system_manifest = "Sovereign Quillan-Ronin v5.4-ONI " * 10  # > 100 bytes
        user_input = "Could you please tell me how the router works?"
        payload = self.optimizer.build_cacheable_prefix(system_manifest, user_input)
        self.assertTrue(payload.is_cache_eligible)
        self.assertNotIn("Could you please", payload.dynamic_delta)
        self.assertIn("router works?", payload.dynamic_delta)


if __name__ == "__main__":
    unittest.main()
