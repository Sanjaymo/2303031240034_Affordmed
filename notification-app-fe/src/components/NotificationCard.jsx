import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const chipColor = {
  Placement: "success",
  Result: "primary",
  Event: "warning",
};

export function NotificationCard({ notification, onMarkViewed }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: notification.viewed ? "divider" : "primary.main",
        bgcolor: notification.viewed ? "background.paper" : "#eef4ff",
      }}
    >
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Box minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            {!notification.viewed && (
              <Tooltip title="New notification">
                <FiberManualRecordIcon color="primary" sx={{ fontSize: 12 }} />
              </Tooltip>
            )}
            <Chip
              size="small"
              color={chipColor[notification.type] ?? "default"}
              label={notification.type}
            />
            <Typography variant="caption" color="text.secondary">
              {notification.timestamp}
            </Typography>
          </Stack>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {notification.message}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {notification.id}
          </Typography>
        </Box>

        <Button
          size="small"
          variant={notification.viewed ? "outlined" : "contained"}
          startIcon={<CheckCircleIcon />}
          onClick={() => onMarkViewed(notification.id)}
          disabled={notification.viewed}
          sx={{ alignSelf: "center", whiteSpace: "nowrap" }}
        >
          {notification.viewed ? "Viewed" : "Mark viewed"}
        </Button>
      </Stack>
    </Paper>
  );
}
