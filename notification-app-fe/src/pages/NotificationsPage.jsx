import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [priorityLimit, setPriorityLimit] = useState(10);

  const {
    notifications,
    priorityNotifications,
    totalPages,
    unreadCount,
    loading,
    error,
    warning,
    markViewed,
    markAllViewed,
  } = useNotifications({ page, limit, filter, priorityLimit });

  const shownNotifications = tab === "priority" ? priorityNotifications : notifications;

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  return (
    <Box sx={{ maxWidth: 920, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="primary" max={99}>
            <NotificationsIcon sx={{ fontSize: 30 }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Campus Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All notifications and priority inbox
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={markAllViewed}
          disabled={notifications.length === 0}
        >
          Mark all viewed
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)} sx={{ mb: 2 }}>
        <Tab value="all" label="All Notifications" />
        <Tab value="priority" label="Priority Notifications" />
      </Tabs>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Page size</InputLabel>
          <Select
            label="Page size"
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 15, 20].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {tab === "priority" && (
          <FormControl size="small" sx={{ minWidth: 145 }}>
            <InputLabel>Priority limit</InputLabel>
            <Select
              label="Priority limit"
              value={priorityLimit}
              onChange={(event) => setPriorityLimit(Number(event.target.value))}
            >
              {[5, 10, 15, 20].map((value) => (
                <MenuItem key={value} value={value}>
                  Top {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && shownNotifications.length === 0 && (
        <Alert severity="info">No notifications found for this selection.</Alert>
      )}

      {!loading && !error && shownNotifications.length > 0 && (
        <Stack spacing={1.5}>
          {shownNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkViewed={markViewed}
            />
          ))}
        </Stack>
      )}

      {!loading && tab === "all" && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
