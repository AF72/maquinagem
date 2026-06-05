import { initials } from '../../lib/helpers';

export function Avatar({ name, cls, small = false }) {
  return (
    <span className={`avatar ${cls}${small ? ' av-sm' : ''}`}>
      {initials(name)}
    </span>
  );
}

export function AvatarLabel({ name, cls, label, small }) {
  return (
    <span className="inline-flex">
      <Avatar name={name} cls={cls} small={small} />
      {label}
    </span>
  );
}
