import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Button } from './button';
import { signOut, useSession } from 'next-auth/react';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';
type Props = {};

export default function User({}: Props) {
  // User data
  const { data }: any = useSession();

  // Handle logout
  const logout = () => {
    // Promise
    const promise = (): Promise<void> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          resolve(await signOut({ callbackUrl: '/auth/login' }));
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang đăng xuất, vui lòng đợi...',
      success: () => {
        // Show message
        return 'Đăng xuất thành công';
      },
      error: (message: string) => `${message}`,
    });
  };

  // Return
  return (
    <div className="flex flex-1 justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {data?.user?.fullname ? (
            <div className="flex md:grow-0 gap-3 cursor-pointer hover:bg-slate-100 py-1.5 px-2 rounded-md">
              <div className="flex items-end flex-col">
                <p className="text-foreground text-[13px] text-nowrap font-[500]">
                  {data?.user && data?.user?.fullname}
                </p>
                <p className="text-muted-foreground text-[12px] text-nowrap">
                  {data?.user && data?.user?.email}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src={'/images/placeholder-user.webp'}
                  blurDataURL="/images/placeholder-user.webp"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </div>
          ) : (
            <div className="flex md:grow-0 gap-3">
              <div className="flex flex-col gap-2 justify-center items-end">
                <Skeleton className="w-[70px] h-[10px]" />
                <Skeleton className="w-[120px] h-[10px]" />
              </div>
              <Skeleton className="w-9 h-9 rounded-full" />
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Cài đặt</DropdownMenuItem>
          <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
