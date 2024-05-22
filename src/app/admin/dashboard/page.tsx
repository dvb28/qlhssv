'use client';
import {
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  FolderKanban,
  RectangleVertical,
  UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacultyStatistical from './statistical/faculty';
import { FC, Fragment, useEffect, useState } from 'react';
import { fetcher } from '@/common/utils/fetcher';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticalType } from '@/common/types/statistical/statistical';

const StatisticalItemSkeleton: FC = () => {
  // Return
  return (
    <Fragment>
      <Card x-chunk="dashboard-05-chunk-1">
        <CardHeader className="pb-2">
          <div>
            <Skeleton className="w-[80%] h-[10px]" />
          </div>
          <div className="text-4xl flex gap-2 items-center">
            <Skeleton className="w-[30px] h-[30px]" />
            <Skeleton className="w-full h-[30px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground flex flex-col gap-2">
            <Skeleton className="w-full h-[10px]" />
            <Skeleton className="w-full h-[10px]" />
            <Skeleton className="w-full h-[10px]" />
            <Skeleton className="w-full h-[10px]" />
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default function Dashboard() {
  // statistical State
  const [statistical, setStatistical] = useState<StatisticalType | null>(null);

  // statistical State
  const [spacStatis, setSpacStatis] = useState<StatisticalType | null>(null);

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effec load
  useEffect(() => {
    (async () => {
      // Fetch
      const loaded = await fetcher({
        method: 'GET',
        url: '/statistical/overview',
      });

      // Fetch
      const sac = await fetcher({
        method: 'GET',
        url: '/statistical/students_and_course',
      });

      // Check sussess
      if (sac?.ok) setSpacStatis(sac?.data);

      // Check sussess
      if (loaded?.ok) setStatistical(loaded?.data);

      // Disable loading
      setIsLoading(false);
    })();
  }, []);

  // Return
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <div>
            {!isLoading && statistical ? (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>Số lượng sinh viên</CardDescription>
                  <CardTitle className="text-4xl flex gap-5 items-center">
                    <UsersRound size={27} />
                    {statistical?.students}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Số sinh viên của trường
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={100} aria-label="25% increase" />
                </CardFooter>
              </Card>
            ) : (
              <div>
                <StatisticalItemSkeleton />
              </div>
            )}
          </div>
          <div>
            {!isLoading && statistical ? (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>Số lượng lớp học</CardDescription>
                  <CardTitle className="text-4xl flex gap-5 items-center">
                    <DoorOpen size={27} />
                    {statistical?.classes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Số lượng lớp học của trường
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={100} aria-label="25% increase" />
                </CardFooter>
              </Card>
            ) : (
              <div>
                <StatisticalItemSkeleton />
              </div>
            )}
          </div>
          <div>
            {!isLoading && statistical ? (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>Số lượng ngành học</CardDescription>
                  <CardTitle className="text-4xl flex gap-5 items-center">
                    <FolderKanban size={27} />
                    {statistical?.majors}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Các ngành đang giảng dạy
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={100} aria-label="25% increase" />
                </CardFooter>
              </Card>
            ) : (
              <div>
                <StatisticalItemSkeleton />
              </div>
            )}
          </div>
          <div>
            {!isLoading && statistical ? (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>Số lượng khoa</CardDescription>
                  <CardTitle className="text-4xl flex gap-5 items-center">
                    <RectangleVertical size={27} />
                    {statistical?.faculty}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Tổng số khoa của trường
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={100} aria-label="25% increase" />
                </CardFooter>
              </Card>
            ) : (
              <div>
                <StatisticalItemSkeleton />
              </div>
            )}
          </div>
        </div>
        <Tabs defaultValue="faculty">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="faculty">Thống kê theo khoa</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="faculty">
            <FacultyStatistical />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Thống kê sinh viên
              </CardTitle>
              <CardDescription>
                Thống kê chi tiết về sinh viên của trường
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-10 text-sm">
            {!isLoading && spacStatis ? (
              <div className="grid gap-3">
                <div className="font-semibold">Chi tiết</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sinh viên nam</span>
                    <span>{spacStatis?.male} sinh viên </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sinh viên nữ</span>
                    <span>{spacStatis?.female} sinh viên </span>
                  </li>
                </ul>
                <Separator className="my-2" />
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Sinh viên bảo lưu
                    </span>
                    <span>{spacStatis?.pending} sinh viên </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Sinh viên bỏ học
                    </span>
                    <span>{spacStatis?.rejected} sinh viên </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Sinh viên đang đi học
                    </span>
                    <span>{spacStatis?.accepted} sinh viên </span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-[15%] h-[15px]" />
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Cập nhật lúc <time dateTime="2023-11-23">20/3/2023</time>
            </div>
            <Pagination className="ml-auto mr-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="sr-only">Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Thống kê khoá học
              </CardTitle>
              <CardDescription>
                Thống kê chi tiết về các niên khoá của trường
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6 text-sm">
            {!isLoading && spacStatis ? (
              <div className="grid gap-3">
                <div className="font-semibold">Chi tiết</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Tổng số niên khoá
                    </span>
                    <span>{spacStatis?.course} khoá học</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Số niên khoá đã tốt nghiệp{' '}
                    </span>
                    <span>{spacStatis?.graduate} khoá học</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex gap-4 flex-col">
                <Skeleton className="w-[15%] h-[15px]" />
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="w-[30%] h-[15px]" />
                  <Skeleton className="w-[60%] h-[15px]" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
