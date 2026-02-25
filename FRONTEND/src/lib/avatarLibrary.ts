export interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

export const AVATAR_LIBRARY: AvatarOption[] = [
  { id: 'appa', label: 'Appa', src: '/avatar-library/avatar_appa.png' },
  { id: 'momo', label: 'Momo', src: '/avatar-library/avatar_momo.png' },
  { id: 'naga', label: 'Naga', src: '/avatar-library/avatar_naga.png' },
  { id: 'pabu', label: 'Pabu', src: '/avatar-library/avatar_pabu.png' }
];
