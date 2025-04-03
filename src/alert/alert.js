function showNotification(title, message, duration = 5000) {
    // Create notification elements
    const notification = document.createElement('div');
    notification.className = 'notification-container';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'notification-title';
    titleEl.textContent = title;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;
    
    const progress = document.createElement('div');
    progress.className = 'notification-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'notification-progress-bar';
    
    // Assemble the notification
    progress.appendChild(progressBar);
    notification.appendChild(titleEl);
    notification.appendChild(messageEl);
    notification.appendChild(progress);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove notification after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 500); // Wait for slide-out animation to complete
    }, duration);
  }