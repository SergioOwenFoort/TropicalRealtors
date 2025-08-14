import { useCallback, useEffect, useState } from 'react';

export function useAuthPopup() {
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);

  // Check if popups are blocked
  const checkPopupBlocked = useCallback(() => {
    const popup = window.open('', '_blank', 'width=1,height=1');
    const isBlocked = !popup || popup.closed;
    if (popup) popup.close();
    return isBlocked;
  }, []);

  useEffect(() => {
    setIsPopupBlocked(checkPopupBlocked());
  }, [checkPopupBlocked]);

  const requestPopupPermission = useCallback(async () => {
    try {
      // Try to open a temporary popup to request permission
      const popup = window.open('', '_blank', 'width=1,height=1');
      if (popup) {
        popup.close();
        setIsPopupBlocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    isPopupBlocked,
    requestPopupPermission
  };
}
