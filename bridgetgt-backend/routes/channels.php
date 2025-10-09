<?php

use Illuminate\Support\Facades\Broadcast;

// Public channels for real-time updates
Broadcast::channel('projects', function () {
    return true; // Public channel
});

Broadcast::channel('tasks', function () {
    return true; // Public channel
});

Broadcast::channel('developers', function () {
    return true; // Public channel
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
