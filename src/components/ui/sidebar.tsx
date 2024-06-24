'use client';
import { Role } from '@/common/enum/role.enum';
import Users from '@/common/interface/Users';
import { verifyRole } from '@/common/utils/ultils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DoorOpen,
  Home,
  LineChart,
  Package,
  Package2,
  UserCog,
  Users2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {};

type SidepathType = {
  path: string;
  icon: any;
  title: string;
  map?: Role[];
};

// Sidebarpath
const sidepaths: SidepathType[] = [
  {
    path: '/admin/dashboard',
    icon: Home,
    title: 'Thống kê',
  },
  {
    path: '/admin/students',
    icon: Users2,
    title: 'Hồ sơ sinh viên',
  },
  {
    path: '/admin/classes',
    icon: DoorOpen,
    title: 'Lớp học',
  },
  {
    path: '/admin/course',
    icon: Package2,
    title: 'Khoá học',
  },
  {
    path: '/admin/faculties',
    icon: Package,
    title: 'Khoa',
  },
  {
    path: '/admin/majors',
    icon: LineChart,
    title: 'Chuyên ngành',
  },
  {
    path: '/admin/users',
    icon: UserCog,
    title: 'Quản lý người dùng',
    map: [Role.ADMIN],
  },
];

export default function Sidebar({}: Props) {
  // Pathname
  const pathname = usePathname();

  // Users
  const user: Users = useSession().data?.user as Users;

  // Return
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-white md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {sidepaths.map((sidepath: SidepathType, index: number) => {
            // Role map
            const roleMaps =
              sidepath?.map && sidepath?.map.length > 0
                ? sidepath.map
                : [Role.USER, Role.ADMIN, Role.MANAGER];

            // Return
            return verifyRole(
              user?.roles,
              roleMaps,
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={sidepath.path}
                    className={`${
                      pathname.startsWith(sidepath.path)
                        ? 'bg-primary text-white'
                        : 'hover:text-foreground text-muted-foreground hover:bg-accent'
                    } rounded-lg flex h-9 w-9 items-center justify-center transition-colors md:h-8 md:w-8`}
                  >
                    <sidepath.icon className="h-5 w-5" />
                    <span className="sr-only">{sidepath.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{sidepath.title}</TooltipContent>
              </Tooltip>,
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
