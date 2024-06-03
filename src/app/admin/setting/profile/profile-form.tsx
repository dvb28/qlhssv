'use client';

import { useSession } from 'next-auth/react';
import ChildForm from './profile-child';

export function ProfileForm() {
  // User data
  const { data }: any = useSession();


  // Return
  return (
    data && <ChildForm
      id={data?.user?.id}
      fullname={data?.user?.fullname}
      email={data?.user?.email}
      gender={data?.user?.gender}
    />
  );
}
