import unittest

class SimpleTest(unittest.TestCase):
    def test_basic_addition(self):
        """
        Test that 1 + 1 = 2
        """
        self.assertEqual(1 + 1, 2)

if __name__ == '__main__':
    unittest.main()
