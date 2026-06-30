from __future__ import annotations

import argparse
import heapq
import json
import os
import sys
from datetime import datetime
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


API_URL = "http://4.224.186.213/evaluation-service/notifications"
TOKEN_ENV_NAME = "AFFORDMED_ACCESS_TOKEN"

TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}


def parse_timestamp(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")


def priority_key(notification: dict[str, Any]) -> tuple[int, datetime]:
    notification_type = notification.get("Type", "")
    timestamp = parse_timestamp(notification["Timestamp"])

    return (TYPE_WEIGHT.get(notification_type, 0), timestamp)


def fetch_notifications(api_url: str) -> list[dict[str, Any]]:
    headers = {"Accept": "application/json"}
    token = os.getenv(TOKEN_ENV_NAME)

    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = Request(api_url, headers=headers, method="GET")

    try:
        with urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        message = f"API request failed with HTTP {exc.code}"
        if exc.code in {401, 403} and not token:
            message += f". Set {TOKEN_ENV_NAME} with your bearer token."
        if "Web Page Blocked" in body:
            message += (
                ". The network is blocking the API URL before the request reaches "
                "the notification service."
            )
            raise RuntimeError(message) from exc
        if body:
            message += f"\nResponse body: {body}"
        raise RuntimeError(message) from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach notification API: {exc.reason}") from exc

    notifications = payload.get("notifications")
    if not isinstance(notifications, list):
        raise RuntimeError("API response does not contain a notifications list.")

    return notifications


def load_notifications_from_file(path: str) -> list[dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as file:
        payload = json.load(file)

    if isinstance(payload, list):
        return payload

    notifications = payload.get("notifications") if isinstance(payload, dict) else None
    if not isinstance(notifications, list):
        raise RuntimeError("Input file must contain a notifications list.")

    return notifications


def get_top_notifications(
    notifications: list[dict[str, Any]],
    limit: int = 10,
) -> list[dict[str, Any]]:
    heap: list[tuple[tuple[int, datetime], int, dict[str, Any]]] = []

    for index, notification in enumerate(notifications):
        if notification.get("Read") is True or notification.get("read") is True:
            continue

        key = priority_key(notification)
        item = (key, index, notification)

        if len(heap) < limit:
            heapq.heappush(heap, item)
        elif item > heap[0]:
            heapq.heapreplace(heap, item)

    return [
        item[2]
        for item in sorted(
            heap,
            key=lambda item: (item[0][0], item[0][1], item[1]),
            reverse=True,
        )
    ]


def print_notifications(notifications: list[dict[str, Any]]) -> None:
    print("=" * 80)
    print("TOP 10 PRIORITY NOTIFICATIONS")
    print("Priority rule: Placement > Result > Event, then newest first")
    print("=" * 80)

    if not notifications:
        print("No unread notifications found.")
        return

    for rank, notification in enumerate(notifications, start=1):
        print(f"{rank:02}. [{notification.get('Type', 'Unknown')}] {notification.get('Message', '')}")
        print(f"    ID        : {notification.get('ID', '')}")
        print(f"    Timestamp : {notification.get('Timestamp', '')}")
        print()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch campus notifications and print the top priority unread notifications.",
    )
    parser.add_argument("--limit", type=int, default=10, help="Number of notifications to show.")
    parser.add_argument("--api-url", default=API_URL, help="Notification API endpoint.")
    parser.add_argument(
        "--input-file",
        help="Optional local JSON file to use when the protected API is unavailable.",
    )
    args = parser.parse_args()

    if args.limit < 1:
        parser.error("--limit must be at least 1")

    try:
        if args.input_file:
            notifications = load_notifications_from_file(args.input_file)
        else:
            notifications = fetch_notifications(args.api_url)
        top_notifications = get_top_notifications(notifications, args.limit)
        print_notifications(top_notifications)
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
