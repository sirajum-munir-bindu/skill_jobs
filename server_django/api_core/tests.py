import json
from django.test import TestCase, Client

class ApiCompatibilityTestSuite(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get('status'), 'ok')

    def test_configs_endpoints(self):
        # 1. GET configs
        res = self.client.get('/api/configs')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, dict)

        # 2. POST configs
        res = self.client.post(
            '/api/configs',
            data=json.dumps({"key": "test_cfg", "value": {"test": 123}}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("message", res.json())

    def test_events_crud(self):
        # 1. POST create
        res = self.client.post(
            '/api/events',
            data=json.dumps({
                "title": "Test AI Seminar",
                "date": "October 15, 2026",
                "time": "10:00 AM",
                "location": "Dhaka",
                "image": "data:image/png;base64,abc",
                "category": "Workshop",
                "status": "Upcoming",
                "regLink": "https://event.skill.jobs/register"
            }),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 201)
        evt_data = res.json()
        evt_id = evt_data["event"]["id"]
        self.assertTrue(evt_id.startswith("evt-"))
        self.assertEqual(evt_data["event"]["_id"], evt_id)

        # 2. GET events
        res = self.client.get('/api/events')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 1)

        # 3. PUT update
        res = self.client.put(
            f'/api/events/{evt_id}',
            data=json.dumps({
                "title": "Updated AI Seminar",
                "date": "October 20, 2026",
                "time": "11:00 AM",
                "location": "Dhaka",
                "image": "data:image/png;base64,xyz",
                "category": "Workshop",
                "status": "Upcoming",
                "regLink": ""
            }),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["event"]["title"], "Updated AI Seminar")

        # 4. DELETE event
        res = self.client.delete(f'/api/events/{evt_id}')
        self.assertEqual(res.status_code, 200)

    def test_auth_and_users_flow(self):
        # 1. Register
        reg_res = self.client.post(
            '/api/auth/register',
            data=json.dumps({
                "name": "Test Participant",
                "email": "participant@test.com",
                "password": "securepassword123"
            }),
            content_type="application/json"
        )
        self.assertEqual(reg_res.status_code, 201)
        user_obj = reg_res.json()["user"]
        user_id = user_obj["id"]

        # 2. Login
        login_res = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                "email": "participant@test.com",
                "password": "securepassword123"
            }),
            content_type="application/json"
        )
        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(login_res.json()["user"]["email"], "participant@test.com")

        # 3. Profile Update
        update_res = self.client.put(
            '/api/auth/update',
            data=json.dumps({
                "id": user_id,
                "name": "Updated Participant Name",
                "email": "participant@test.com"
            }),
            content_type="application/json"
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["user"]["name"], "Updated Participant Name")

        # 4. Admin Users List
        users_res = self.client.get('/api/users')
        self.assertEqual(users_res.status_code, 200)
        self.assertGreaterEqual(len(users_res.json()), 1)

        # 5. Admin Create User
        admin_create_res = self.client.post(
            '/api/users',
            data=json.dumps({
                "name": "Admin Created Ambassador",
                "email": "amb@test.com",
                "password": "password123",
                "role": "Campus Ambassador",
                "permissions": ["ambassador_performance", "ambassador_workreport"]
            }),
            content_type="application/json"
        )
        self.assertEqual(admin_create_res.status_code, 201)
        amb_user_id = admin_create_res.json()["user"]["id"]

        # 6. Bulk delete
        del_res = self.client.post(
            '/api/users/bulk-delete',
            data=json.dumps({"userIds": [user_id, amb_user_id]}),
            content_type="application/json"
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertEqual(del_res.json()["deletedCount"], 2)

    def test_ambassadors_and_work_reports(self):
        # 1. Apply
        apply_res = self.client.post(
            '/api/ambassador/apply',
            data=json.dumps({
                "name": "Test Ambassador",
                "email": "amb_lead@du.ac.bd",
                "phone": "+8801812345678",
                "university": "Dhaka University",
                "reason": "Passionate about student leadership",
                "dept": "CSE",
                "role": "Campus Lead"
            }),
            content_type="application/json"
        )
        self.assertEqual(apply_res.status_code, 201)
        amb_id = apply_res.json()["application"]["id"]

        # 2. Patch status
        patch_res = self.client.patch(
            f'/api/ambassadors/{amb_id}',
            data=json.dumps({"status": "Approved"}),
            content_type="application/json"
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["application"]["status"], "Approved")

        # 3. Work report submission
        wr_res = self.client.post(
            '/api/work-reports',
            data=json.dumps({
                "name": "New Candidate",
                "email": "cand@du.ac.bd",
                "phone": "+8801700000000",
                "ambassadorEmail": "amb_lead@du.ac.bd",
                "ambassadorName": "Test Ambassador",
                "institution": "Dhaka University"
            }),
            content_type="application/json"
        )
        self.assertEqual(wr_res.status_code, 201)
        wr_id = wr_res.json()["workReport"]["id"]

        # 4. Filter work reports
        get_wr_res = self.client.get(f'/api/work-reports?ambassadorEmail=amb_lead@du.ac.bd')
        self.assertEqual(get_wr_res.status_code, 200)
        self.assertEqual(len(get_wr_res.json()), 1)

        # 5. Update work report status
        wr_status_res = self.client.patch(
            f'/api/work-reports/{wr_id}/status',
            data=json.dumps({"status": "Approved"}),
            content_type="application/json"
        )
        self.assertEqual(wr_status_res.status_code, 200)
        self.assertEqual(wr_status_res.json()["workReport"]["status"], "Approved")

        # Cleanup
        self.client.delete(f'/api/work-reports/{wr_id}')
        self.client.delete(f'/api/ambassadors/{amb_id}')

    def test_nfc_orders_and_contact(self):
        # 1. Contact submission
        msg_res = self.client.post(
            '/api/contact',
            data=json.dumps({
                "name": "Inquirer",
                "email": "inquiry@gmail.com",
                "subject": "Corporate Partnership",
                "message": "Interested in organizing campus seminar"
            }),
            content_type="application/json"
        )
        self.assertEqual(msg_res.status_code, 201)
        msg_id = msg_res.json()["contactMessage"]["id"]

        # Delete contact message
        self.client.delete(f'/api/messages/{msg_id}')

        # 2. NFC Order submission
        nfc_res = self.client.post(
            '/api/nfc-orders',
            data=json.dumps({
                "customerName": "Sabbir Hasan",
                "customerEmail": "sabbir@nfc.io",
                "customerPhone": "+8801912345678",
                "deliveryAddress": "House 10, Road 4, Dhanmondi",
                "district": "Dhaka",
                "cardVariantId": "matte-black",
                "cardVariantName": "Obsidian Matte Black",
                "customNameOnCard": "Sabbir Hasan",
                "customRoleOnCard": "Tech Lead",
                "paymentMethod": "bkash",
                "trxId": "TRX987654321",
                "quantity": 1,
                "unitPrice": 499,
                "subtotal": 499,
                "deliveryCharge": 60,
                "grandTotal": 559
            }),
            content_type="application/json"
        )
        self.assertEqual(nfc_res.status_code, 201)
        order_id = nfc_res.json()["orderId"]

        # Update order status
        status_res = self.client.put(
            f'/api/nfc-orders/{order_id}/status',
            data=json.dumps({"status": "Shipped"}),
            content_type="application/json"
        )
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["order"]["status"], "Shipped")

        # Cleanup
        self.client.delete(f'/api/nfc-orders/{order_id}')
