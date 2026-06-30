# Stage 1

## Priority Inbox Approach

The Priority Inbox displays the top `n` unread notifications by combining notification type priority and recency.

Priority order by type:

1. Placement
2. Result
3. Event

For notifications with the same type priority, the latest timestamp is shown first. This means an older Placement notification still ranks above a newer Result or Event notification because the requirement gives type weight first priority.

## Algorithm

1. Fetch notifications from the provided Notification API.
2. Ignore notifications marked as read, if the API includes a read flag.
3. Convert each notification into a priority key:
   - Type weight: Placement = 3, Result = 2, Event = 1.
   - Timestamp: newer timestamps rank higher within the same type.
4. Maintain a min-heap of size `n`.
5. For each incoming notification:
   - If the heap has fewer than `n` items, insert the notification.
   - Otherwise compare it with the smallest priority item in the heap.
   - If the new notification has higher priority, replace the smallest item.
6. Sort the final heap in descending priority order before displaying the result.

## Efficiency

For `m` total notifications and inbox size `n`, the heap approach runs in `O(m log n)` time and uses `O(n)` extra space. This is efficient when new notifications keep arriving because the application never needs to sort the full notification list every time.

For Stage 1, `notify.py` fetches the notifications and prints the top 10 priority notifications. The bearer token is read from the `AFFORDMED_ACCESS_TOKEN` environment variable if the protected API requires authentication, so credentials are not committed to the repository.
