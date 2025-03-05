import React, { useState, useEffect } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications for the logged-in user
  useEffect(() => {
    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    }
  };
// Mark a notification as read
const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/mark-as-read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Update the notifications list
      const updatedNotifications = notifications.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking notification as read:", error.response?.data || error.message);
    }
  };
  const handleDeleteRead = async () => {
    try {
      await axios.delete("http://localhost:5000/api/notifications/delete-read", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchNotifications(); // Refresh the notifications list
    } catch (error) {
      console.error("Error deleting read notifications:", error.response?.data || error.message);
    }
  };
  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul>
          {notifications.map((notif) => (
            <li key={notif._id} style={{ color: notif.isRead ? "gray" : "black" }}>
              <p>{notif.message}</p>
              {!notif.isRead && (
                <button onClick={() => handleMarkAsRead(notif._id)}>Mark as Read</button>
              )}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleDeleteRead}>Delete Read Notifications</button>
    </div>
  );
};

export default Notifications;