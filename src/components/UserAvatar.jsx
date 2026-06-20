import { CONFIG } from '../config';

const getGenderGradient = (gender) => {
  const isMale = ['male', 'm', 'groom'].includes(String(gender).toLowerCase());
  return {
    color1: isMale ? '%2360a5fa' : '%23f472b6',
    color2: isMale ? '%232563eb' : '%23db2777',
  };
};

const fallbackSvg = (gender) => {
  const { color1, color2 } = getGenderGradient(gender);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${color1}'/%3E%3Cstop offset='100%25' stop-color='${color2}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23bg)'/%3E%3Ccircle cx='50' cy='36' r='18' fill='white'/%3E%3Cpath d='M15,100 Q15,65 50,65 Q85,65 85,100 Z' fill='white'/%3E%3C/svg%3E`;
};

const UserAvatar = ({ user, profile, size = 32, style }) => {
  const profilePic = profile?.profile_picture
    ?? user?.user_profile?.profile_picture
    ?? user?.profile_picture;
  const gender = profile?.gender
    ?? user?.user_profile?.gender
    ?? user?.gender
    ?? '';

  const imgSrc = profilePic
    ? (profilePic.startsWith('http')
        ? profilePic
        : `${CONFIG.BASE_URL}/storage/${profilePic}`)
    : fallbackSvg(gender);

  return (
    <img
      src={imgSrc}
      alt=""
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackSvg(gender);
      }}
    />
  );
};

export default UserAvatar;
