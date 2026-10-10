from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase


class DashboardAccessTests(TestCase):
    def test_anonymous_user_is_redirected_to_login(self):
        response = self.client.get("/dashboard/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response.url)

    def test_non_staff_user_cannot_access_dashboard(self):
        user = get_user_model().objects.create_user(
            username="regular-user",
            password="test-password-123",
            is_staff=False,
        )
        self.client.force_login(user)

        response = self.client.get("/dashboard/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response.url)


class DashboardRenderingTests(TestCase):
    @patch("dashboard.views.db")
    def test_staff_user_sees_analytics(self, mock_db):
        user = get_user_model().objects.create_user(
            username="staff-user",
            password="test-password-123",
            is_staff=True,
        )
        self.client.force_login(user)

        mock_db.__getitem__.side_effect = lambda name: {
            "products": mock_db.products,
            "categories": mock_db.categories,
            "users": mock_db.users,
            "orders": mock_db.orders,
            "payments": mock_db.payments,
        }[name]

        mock_db.products.count_documents.side_effect = [12, 10, 2, 3]
        mock_db.categories.count_documents.return_value = 4
        mock_db.users.count_documents.side_effect = [6, 5]
        mock_db.orders.count_documents.return_value = 5
        mock_db.payments.aggregate.side_effect = [
            [{"_id": "PAID", "count": 2}, {"_id": "CREATED", "count": 1}],
            [{"_id": None, "total": 65000}],
        ]

        response = self.client.get("/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "E-commerce Analytics")
        self.assertContains(response, "65,000.00")
        self.assertContains(response, "PAID")
        self.assertContains(response, "CREATED")
