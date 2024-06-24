'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  ShoppingCart,
  Users2,
} from 'lucide-react';
import Link from 'next/link';
import User from './user';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
type Props = {};

// Render breadcrumb
const breadcrumb = (path: string) => {
  // Check by switch
  switch (path) {
    case 'students':
      return <Link href={`/admin/students`}>Hồ sơ sinh viên</Link>;
    case 'classes':
      return <Link href={`/admin/classes`}>Lớp học</Link>;
    case 'faculties':
      return <Link href={`/admin/faculties`}>Khoa</Link>;
    case 'majors':
      return <Link href={`/admin/majors`}>Chuyên ngành</Link>;
    case 'course':
      return <Link href={`/admin/course`}>Khoá học</Link>;
    case 'setting':
      return <Link href={`/admin/setting`}>Cài đặt</Link>;
    case 'appearance':
      return <Link href={`/admin/setting/appearance`}>Giao diện</Link>;
    case 'student-add':
      return <Link href={`/admin/students/student-add`}>Thêm hồ sơ sinh viên</Link>;
    case 'student-detail':
      return <Link href={`/admin/students/student-detail`}>Thông tin</Link>;
    case 'users':
      return <Link href={`/admin/users`}>Quản lý người dùng</Link>;
    case 'admin':
      return <Link href={`/admin/dashboard`}>Trang chủ</Link>;
    default:
      return '';
  }
};

export default function Header({}: Props) {
  // Pathname
  const pathnames = usePathname()
    .split('/')
    .filter((i) => i !== '');

  // Return
  return (
    <header className="sticky top-0 justify-between z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Users2 className="h-5 w-5" />
              Customers
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {pathnames?.map((path: string, i: number) => (
            <Fragment key={i}>
              {!['admin', 'dashboard'].includes(path) && (
                <BreadcrumbSeparator />
              )}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>{breadcrumb(path)}</BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <User />
    </header>
  );
}
