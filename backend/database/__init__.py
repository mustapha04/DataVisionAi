import httpx
from typing import Any
from core.config import settings


class SupabaseClient:
    def __init__(self):
        self.url = settings.supabase_url
        self.key = settings.supabase_service_key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def table(self, name: str):
        return TableBuilder(self, name)


class TableBuilder:
    def __init__(self, client: SupabaseClient, table: str):
        self.client = client
        self.table = table
        self.params = {"select": "*"}
        self._is_single = False

    def select(self, cols: str = "*"):
        self.params["select"] = cols
        return self

    def eq(self, col: str, val: Any):
        self.params[col] = f"eq.{val}"
        return self

    def order(self, col: str, desc: bool = True):
        self.params["order"] = f"{col}.{'desc' if desc else 'asc'}"
        return self

    def limit(self, n: int):
        self.params["limit"] = str(n)
        return self

    def single(self):
        self._is_single = True
        return self

    def execute(self):
        method = "GET"
        url = f"{self.client.url}/rest/v1/{self.table}"
        with httpx.Client() as client:
            resp = client.request(method, url, headers=self.client.headers, params=self.params)
            resp.raise_for_status()
            data = resp.json() if resp.content else []
        if self._is_single:
            data = data[0] if data else None
        data = data if data is not None else []
        return Result(data)

    def insert(self, json_data: Any):
        url = f"{self.client.url}/rest/v1/{self.table}"
        with httpx.Client() as client:
            resp = client.post(url, headers=self.client.headers, json=json_data)
            resp.raise_for_status()
            data = resp.json() if resp.content else []
        return Result(data)

    def delete(self):
        url = f"{self.client.url}/rest/v1/{self.table}"
        with httpx.Client() as client:
            resp = client.delete(url, headers=self.client.headers, params=self.params)
            resp.raise_for_status()
            data = resp.json() if resp.content else []
        return Result(data)


class Result:
    def __init__(self, data):
        self.data = data


supabase = SupabaseClient()
