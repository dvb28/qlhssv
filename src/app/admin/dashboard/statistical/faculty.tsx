'use client';
import { ListFilter } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { FacultyDetail } from '@/common/types/faculty/detail';
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
import { CaretSortIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Empty from '@/components/ui/empty';
import { fetcher } from '@/common/utils/fetcher';
import { PageConfig } from '@/common/types/page.config.type';

const IdToColumn = (key: string) => {
  switch (key) {
    case 'identifier_id':
      return 'Mã khoa';
    case 'name':
      return 'Tên khoa';
    case 'students':
      return 'Số sinh viên';
    case 'classes':
      return 'Số lớp';
    case 'majors':
      return 'Số ngành';
  }
};

const columns: ColumnDef<FacultyDetail>[] = [
  {
    accessorKey: 'identifier_id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mã khoa
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('identifier_id')}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tên khoa
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'students',
    header: () => (
      <Button className="w-full" variant="ghost">
        <div className="flex justify-start flex-1 w-100">
          <p>Số sinh viên</p>
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      // Return
      return <div className="text-left">{row.original.students} sinh viên</div>;
    },
  },
  {
    accessorKey: 'classes',
    header: () => (
      <Button className="w-full" variant="ghost">
        <div className="flex justify-start flex-1 w-100">
          <p>Số lớp</p>
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      // Return
      return <div className="text-left">{row.original.classes} lớp học</div>;
    },
  },
  {
    accessorKey: 'majors',
    header: () => (
      <Button className="w-full" variant="ghost">
        <div className="flex justify-start flex-1 w-100">
          <p>Số ngành</p>
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      // Return
      return <div className="text-left">{row.original.majors} ngành</div>;
    },
  },
];

type Props = {};

export default function FacultyStatistical({}: Props) {
  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Faculty list
  const [faculties, setFaculties] = useState<FacultyDetail[]>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

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

  // Table
  const table = useReactTable({
    data: faculties,
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
    },
  });

  // Load faculties with page
  const loadFaculties = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/statistical/faculty',
      payload: { page },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to faculty
      setFaculties(data);

      // Set page config
      setPageConfig(pageConfig);
    }

    // Disable loading
    setIsLoading(false);
  };

  // Effect load faculties
  useEffect(() => {
    (async () => await loadFaculties(page))();
  }, [page, isPageChange]);

  // Return
  return (
    <Card x-chunk="dashboard-05-chunk-3">
      <div className="flex justify-between items-center">
        <div>
          <CardHeader className="px-7">
            <CardTitle>Thống kê theo khoa</CardTitle>
            <CardDescription>
              Thống kê các lớp, sinh viên, ngành theo khoa.
            </CardDescription>
          </CardHeader>
        </div>
        <div className="px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Hiển thị cột
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {IdToColumn(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent>
        <Table>
          <TableHeader>
            {!isLoading ? (
              table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((head) => (
                    <TableHead key={head.id}>
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
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableCell key={index} className="text-center px-6 py-2">
                    <Skeleton className="h-[20px]" />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {!isLoading ? (
              faculties?.length > 0 && table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`py-1 ${
                          !cell.id.includes('select') && 'pl-6'
                        }`}
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
                      <Empty desc="Không có khoa nào" />
                    </div>
                  </TableCell>
                </TableRow>
              )
            ) : (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <TableCell key={index} className="text-center px-6 py-2">
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
                  Array.from({ length: pageConfig?.pages })?.map((_, index) => (
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
                  ))}
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
            {pageConfig ? 10 * (page - 1) + faculties.length : 0}
          </strong>{' '}
          trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> khoa
        </div>
      </CardFooter>
    </Card>
  );
}
