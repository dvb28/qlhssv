'use client';
import { errors, getCommonPinningStyles } from '@/common/utils/ultils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerOverlay,
  DrawerPortal,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Empty from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { toast } from 'sonner';
import { fetcher } from '@/common/utils/fetcher';
import { PageConfig } from '@/common/types/page.config.type';

enum ApproveSearchEnum {
  BOTH = 'BOTH',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

// Validate Schema
const searchSchema = z.object({
  search: z
    .string({
      required_error: 'ui lòng nhập nội dung tìm kiếm',
    })
    .min(1, { message: 'Vui lòng nhập nội dung tìm kiếm' }),
  field: z.string({
    required_error: 'Vui lòng chọn cột muốn tìm kiếm',
  }),
  approve: z.enum(
    [ApproveSearchEnum.BOTH, ApproveSearchEnum.TRUE, ApproveSearchEnum.FALSE],
    {
      required_error: 'Trường này không được trống.',
    },
  ),
});

// Props
type Props = {
  columns: ColumnDef<any>[];
  IdToColumn: Function;
  handled: any;
  preSearchHandle?: Function;
  setHandled: React.Dispatch<React.SetStateAction<any>>;
  title: string;
  searchFields: string[];
  source: string;
};

export default function StudentTableSearch({
  title,
  source,
  columns,
  handled,
  IdToColumn,
  searchFields,
  setHandled,
  preSearchHandle,
}: Props) {
  // Form
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: '',
      approve: ApproveSearchEnum.BOTH,
    },
  });

  // Search result
  const [result, setResult] = useState<any>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  // Next page
  const nextPage = () => setPage(page + 1);

  // Next page
  const previousPage = () => setPage(page - 1);

  // Submit
  function onSubmit(values: z.infer<typeof searchSchema>) {
    // Promise
    const promise = (): Promise<any> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const search = await fetcher({
            method: 'GET',
            url: `${source}/search`,
            payload: { ...values, page },
          });

          // Check request
          search?.ok ? resolve(search?.data) : reject(search?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang tìm kiếm, vui lòng đợi...',
      success: (res: any) => {
        // Destruc
        const { data, ...config } = res;

        // Set data to result
        setResult(data);

        // Set page config
        setPageConfig(config);

        // Show message
        return `Tìm kiếm được ${config.total} kết quả`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  }

  // Submit error
  function onError() {
    // Show erorr
    toast.error('Vui lòng nhập đầy đủ thông tin để tìm kiểm');
  }

  // Table
  const table = useReactTable({
    data: result,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnPinning: {
        right: ['actions'],
        left: ['select'],
      },
    },
  });

  // Listen handled
  const listenHandled = (handled: any) => {
    // Check
    switch (handled?.[0]) {
      case 'DELETE':
        // Check is multiple
        if (handled?.[1] === 1) {
          // Check deletes length
          if (result.length === handled?.[2]?.length && page !== 1) {
            // Load previous page
            setPage(page - 1);
          } else {
            // Load current page
            setIsPageChange(!isPageChange);
          }
        } else {
          // Check deletes length
          if (result.length === 1) {
            // Load previous page
            setPage(page - 1);
          } else {
            // Load current page
            setIsPageChange(!isPageChange);
          }
        }
        break;
      case 'UPDATE':
        // Update data
        const updatedItems = result.map((item: any, i: number) => {
          // Check row index
          if (i === handled?.[1]) return handled?.[2];

          // Return
          return item;
        });

        // Set Data
        setResult(updatedItems);
        break;
    }

    // Set handled
    setHandled([]);
  };

  const loadResult = async (page: number) => {
    // Destruc
    const { search, field } = form.getValues();

    // Check
    if (!search || !field) {
      // Run error show
      onError();
    } else {
      // Enable loading
      setIsLoading(true);

      // Fetch
      const fetch = await fetcher({
        method: 'GET',
        url: `${source}/search`,
        payload: { page },
      });

      // Check success
      if (fetch?.ok) {
        // Destruc
        const { data, ...pageConfig } = fetch.data;

        // Set data to students
        setResult(data);

        // Set page config
        setPageConfig(pageConfig);
      }

      // Disable loading
      setIsLoading(false);
    }
  };

  // Effect load students
  useEffect(() => {
    (async () => {
      result?.length > 0 && (await loadResult(page));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isPageChange]);

  // Effect
  useEffect(() => {
    (async () => {
      handled?.length > 0 && (await listenHandled(handled));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handled]);
  // Return
  return (
    <Drawer shouldScaleBackground>
      <DrawerTrigger asChild>
        <Button variant="outline" size={'sm'}>
          <Search className="mr-2 h-4 w-4" /> Tìm kiếm
        </Button>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 bg-black/40" />
        <DrawerContent className="bg-zinc-100 p-5 pt-0 flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0">
          <Card>
            <div className="w-full flex justify-between items-center max-lg:flex-col">
              <div className="max-lg:w-full">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="text-nowrap">
                    Tìm kiếm thông tin dựa theo các cột cụ thể
                  </CardDescription>
                </CardHeader>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, onError)}
                  className="flex px-6 w-full justify-end max-lg:justify-start max-md:flex-col gap-[2px] max-md:gap-3"
                >
                  <div className="relative md:grow-0 flex gap-[2px] max-lg:w-full w-[60%]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name="search"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              type="search"
                              placeholder="Nội dung tìm kiếm..."
                              className="w-full rounded-lg bg-background pl-8"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Tìm kiếm</Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="field"
                    render={({ field }) => (
                      <FormItem className="grid">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px] max-md:w-full">
                              <SelectValue placeholder="Chọn cột tìm kiếm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {table
                              .getAllColumns()
                              .filter((column) => column.getCanHide())
                              .map((column) => {
                                return (
                                  searchFields.includes(column.id) && (
                                    <SelectItem
                                      key={column.id}
                                      className="capitalize"
                                      value={column.id}
                                    >
                                      {IdToColumn(column.id)}
                                    </SelectItem>
                                  )
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="approve"
                    render={({ field }) => (
                      <FormItem className="grid">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px] max-md:w-full">
                              <SelectValue placeholder="Chọn cột tìm kiếm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              key={ApproveSearchEnum.BOTH}
                              value={ApproveSearchEnum.BOTH}
                            >
                              Cả hai
                            </SelectItem>
                            <SelectItem
                              key={ApproveSearchEnum.TRUE}
                              value={ApproveSearchEnum.TRUE}
                            >
                              Đã xét duyệt
                            </SelectItem>
                            <SelectItem
                              key={ApproveSearchEnum.FALSE}
                              value={ApproveSearchEnum.FALSE}
                            >
                              Chưa xét duyệt
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            <CardContent>
              <Table>
                <TableHeader>
                  {!isLoading ? (
                    table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((head) => (
                          <TableHead
                            key={head.id}
                            style={{ ...getCommonPinningStyles(head.column) }}
                          >
                            {head.isPlaceholder
                              ? null
                              : flexRender(
                                  head.column.columnDef.header,
                                  head.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center w-[20px]">
                        <Skeleton className="w-[18px] h-[20px]" />
                      </TableCell>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableCell
                          key={index}
                          className="text-center px-6 py-2"
                        >
                          <Skeleton className="h-[20px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {!isLoading ? (
                    result?.length > 0 && table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={`py-1 ${
                                !cell.id.includes('select') &&
                                (cell.column.getIsLastColumn('right')
                                  ? 'pl-2'
                                  : 'pl-6')
                              }`}
                              style={{ ...getCommonPinningStyles(cell.column) }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 1}
                          className="h-24 text-center"
                        >
                          <div className="py-4">
                            <Empty desc="Không có kết quả tìm kiếm nào" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center w-[20px]">
                          <Skeleton className="w-[18px] h-[20px]" />
                        </TableCell>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <TableCell
                            key={index}
                            className="text-center px-6 py-2"
                          >
                            <Skeleton className="h-[20px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} /{' '}
                  {table.getFilteredRowModel().rows.length} hàng được chọn.
                </div>
                <div className="space-x-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={previousPage}
                          disabled={
                            isLoading ||
                            pageConfig?.page === 1 ||
                            pageConfig?.pages === 0
                          }
                        >
                          Trước
                        </Button>
                      </PaginationItem>
                      {pageConfig &&
                        pageConfig?.pages > 0 &&
                        Array.from({ length: pageConfig?.pages })?.map(
                          (_, index) => (
                            <PaginationItem
                              key={index}
                              className="cursor-pointer"
                              onClick={async () =>
                                !(index + 1 === page) && setPage(index + 1)
                              }
                            >
                              <PaginationLink isActive={page === index + 1}>
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={
                            isLoading ||
                            pageConfig?.pages === 0 ||
                            pageConfig?.page === pageConfig?.pages
                          }
                        >
                          Tiếp
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Hiển thị{' '}
                <strong>
                  {pageConfig ? (page === 1 ? 1 : 10 * (page - 1)) : 0} -{' '}
                  {pageConfig ? 10 * (page - 1) + result.length : 0}
                </strong>{' '}
                trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> khoa
              </div>
            </CardFooter>
          </Card>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
