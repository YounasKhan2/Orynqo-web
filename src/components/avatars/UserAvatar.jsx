import React from 'react';
import { Avatar } from '../../design-system';

/**
 * UserAvatar Product Component
 * Adapts domain User entities to the design-system Avatar primitive
 */
export function UserAvatar({
  user,
  size = 'sm',
  showName = false,
  showRole = false,
  presence,
  className = '',
  style = {}
}) {
  if (!user) {
    return <Avatar size={size} className={className} style={style} />;
  }

  return (
    <Avatar
      src={user.avatar}
      name={user.name}
      initials={user.initials}
      subtitle={showRole ? user.role : undefined}
      size={size}
      showName={showName}
      presence={presence}
      className={className}
      style={style}
    />
  );
}
