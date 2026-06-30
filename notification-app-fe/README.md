# Campus Notifications Frontend

React frontend for the Affordmed campus notifications evaluation.

## Features

- Displays all notifications.
- Displays priority notifications separately.
- Supports notification type filters: `All`, `Placement`, `Result`, and `Event`.
- Supports pagination using `page` and `limit`.
- Supports configurable priority limit for top `n` notifications.
- Distinguishes new and viewed notifications using browser `localStorage`.
- Includes logging calls for important frontend/API actions.
- Uses Material UI for styling.
- Runs on `http://localhost:3000`.

## Priority Rule

Priority notifications are sorted by notification type weight and recency:

1. `Placement`
2. `Result`
3. `Event`

If two notifications have the same type, the newer notification is shown first.

## Setup

```powershell
cd "C:\Users\Sanjay Choudhari\Desktop\Affordmed\Campus-Evaluation-FE\notification-app-fe"
npm install
```

## Run Frontend

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/
```

## Build

```powershell
npm run build
```

## Screenshots and Video

Submission media is available in the repository root `screenshots` folder:

- `screenshots/Stage1-Code-Output.png`
- `screenshots/Stage2_DisplayWebsite.png`
- `screenshots/Stage2-Demo-Video.mp4`

## Stage 1 Script

Run the priority notification script with sample notifications:

```powershell
python notify.py --input-file notifications.json.example
```

Run with the real API:

```powershell
python notify.py
```

If the API requires a bearer token:

```powershell
$env:AFFORDMED_ACCESS_TOKEN="your_token_here"
python notify.py
```

## API

The frontend calls:

```text
http://4.224.186.213/evaluation-service/notifications
```

Supported query parameters:

- `limit`
- `page`
- `notification_type`

If the API is unavailable or blocked by the current network, the frontend shows bundled sample notifications so the UI and flows can still be tested.
