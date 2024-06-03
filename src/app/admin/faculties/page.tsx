'use client';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { fetcher } from '@/common/utils/fetcher';
import { FC, Fragment, MouseEvent, useEffect, useState } from 'react';
import Empty from '@/components/ui/empty';
import { format } from 'date-fns';
import type Faculty from '@/common/interface/Faculty';
import { CaretSortIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FacultyDetail } from '@/common/types/faculty/detail';
import { Separator } from '@/components/ui/separator';
import TableSearch from '@/components/custom/table.search';
import { PageConfig } from '@/common/types/page.config.type';
import { errors, getCommonPinningStyles } from '@/common/utils/ultils';

const IdToColumn = (key: string) => {
  switch (key) {
    case 'identifier_id':
      return 'Mã khoa';
    case 'name':
      return 'Tên khoa';
    case 'desc':
      return 'Mô tả';
    case 'created_at':
      return 'Ngày tạo';
    case 'updated_at':
      return 'Ngày cập nhật';
  }
};

// Validate Schema
const facultySchema = z.object({
  name: z.string({ required_error: 'Trường này không được trống' }).min(1, {
    message: 'Tên khoa là bắt buộc',
  }),
  desc: z.any(),
  identifier_id: z
    .string({
      required_error: 'Mã định danh khoa là bắt buộc',
    })
    .min(1, {
      message: 'Mã định danh khoa là bắt buộc',
    }),
});

type UpdateFormType = {
  row: Row<Faculty>;
  faculties: Faculty[];
  loadingUpdateFaculty: boolean;
  setHandled: React.Dispatch<React.SetStateAction<any>>;
  setLoadingUpdateFaculty: React.Dispatch<React.SetStateAction<boolean>>;
  setFaculties: React.Dispatch<React.SetStateAction<Faculty[]>>;
};

const UpdateForm: FC<UpdateFormType> = ({
  row,
  faculties,
  setHandled,
  setFaculties,
  loadingUpdateFaculty,
  setLoadingUpdateFaculty,
}) => {
  // Form update faculty
  const formUpdate = useForm<z.infer<typeof facultySchema>>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: row.original.name,
      desc: row.original.desc,
      identifier_id: row.original.identifier_id,
    },
  });

  // Update
  function onUpdate(values: z.infer<typeof facultySchema>) {
    // Close dialog
    setLoadingUpdateFaculty(true);

    // Promise
    const promise = (): Promise<Faculty> =>
      new Promise(async (resolve, reject) => {
        setTimeout(async () => {
          // Fetch
          const created = await fetcher({
            method: 'PUT',
            url: '/faculty/update',
            payload: {
              id: row.original.id,
              ...values,
            },
          });

          // Check request
          created?.ok ? resolve(created?.data) : reject(created?.message);
        }, 1000);
      });

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật thông tin khoa, vui lòng đợi...',
      success: (data: Faculty) => {
        // Update data
        const updatedItems = faculties.map((item: Faculty, i: number) => {
          // Check row index
          if (i === row.index) return data;

          // Return
          return item;
        });

        // Set data
        setHandled(['UPDATE', row.index, data]);

        // Set data
        setFaculties(updatedItems);

        // Show message
        return 'Cập nhật thông tin khoa thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Disable loading
        setLoadingUpdateFaculty(false);

        // Reset form value
        formUpdate.reset();
      },
    });
  }

  return (
    <Form {...formUpdate}>
      <form onSubmit={formUpdate.handleSubmit(onUpdate)}>
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin của khoa</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin khoa {row.original.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="identifier_id"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Mã khoa</FormLabel>
                  <FormControl>
                    <Input placeholder="Mã khoa" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Tên khoa</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên khoa" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="desc"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={loadingUpdateFaculty} type="submit">
            {loadingUpdateFaculty && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cập nhật
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

type ViewDetailType = {
  id: string;
};

const ViewDetail: FC<ViewDetailType> = ({ id }) => {
  // Faculty detail
  const [detail, setDetail] = useState<FacultyDetail | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect load detail
  useEffect(() => {
    (async () => {
      // Fetch
      const loaded = await fetcher({
        method: 'GET',
        url: '/faculty/statistical',
        payload: { id },
      });

      // Delay
      setTimeout(() => {
        // Disable loading
        setIsLoading(false);

        // Check sussess
        if (loaded?.ok) setDetail(loaded?.data);
      }, 1000);
    })();
  }, [id]);

  // Return
  return (
    <Fragment>
      <DialogHeader>
        <DialogTitle>Chi tiết khoa</DialogTitle>
        <DialogDescription>
          Xem thông tin chi tiết, và thống kê của khoa
        </DialogDescription>
      </DialogHeader>
      {!isLoading ? (
        detail && (
          <Fragment>
            <div>
              <p className="text-sm font-medium">Thống kê</p>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <p className="text-sm">Số lớp của khoa:</p>
                  <p className="text-sm">Số ngành của khoa:</p>
                  <p className="text-sm">Số sinh viên của khoa:</p>
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <p>{detail.classes} lớp</p>
                  <p>{detail.majors} ngành</p>
                  <p>{detail.students} sinh viên</p>
                </div>
              </div>
            </div>
            <Separator className="my-1" />
            <div>
              <p className="text-sm font-medium">Thông tin</p>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <p className="text-sm">Mã khoa:</p>
                  <p className="text-sm">Tên khoa:</p>
                  <p className="text-sm">Ngày tạo:</p>
                  <p className="text-sm">Lần cập nhật gần nhất:</p>
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <p>{detail.identifier_id}</p>
                  <p>{detail.name}</p>
                  <p>{format(detail.created_at, 'dd/MM/yyyy')}</p>
                  <p>{format(detail.updated_at, 'dd/MM/yyyy')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Mô tả</p>
                <p className="text-sm text-muted-foreground">
                  {detail?.desc
                    ? detail.desc
                    : `Không có mô tả nào cho khoa ${detail.name}`}
                </p>
              </div>
            </div>
          </Fragment>
        )
      ) : (
        <div>
          <Fragment>
            <div>
              <Skeleton className="w-[40px] h-[20px]" />
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                </div>
              </div>
            </div>
            <Separator className="my-5" />
            <div>
              <Skeleton className="w-[40px] h-[20px]" />
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                  <Skeleton className="w-full h-[20px]" />
                </div>
              </div>
            </div>
          </Fragment>
        </div>
      )}
    </Fragment>
  );
};

export default function Faculties() {
  // Form
  const form = useForm<z.infer<typeof facultySchema>>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: '',
      desc: '',
      identifier_id: '',
    },
  });

  // Handled
  const [handled, setHandled] = useState<any>();

  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Dialog Create
  const [open, setOpen] = useState<boolean>(false);

  // Dialog Update
  const [loadingUpdateFaculty, setLoadingUpdateFaculty] =
    useState<boolean>(false);

  // Faculty list
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  // Row delete
  const rowDelete = (e: MouseEvent) => {
    // Stop default
    e.preventDefault();

    // Delete faculties
    deleteFaculties(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  // Submit
  function onSubmit(values: z.infer<typeof facultySchema>) {
    // Close dialog
    setOpen(false);

    // Promise
    const promise = (): Promise<Faculty> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const created = await fetcher({
            method: 'POST',
            url: '/faculty/create',
            payload: {
              ...values,
              identifier_id: values.identifier_id.trim(),
            },
          });

          // Check request
          created?.ok ? resolve(created?.data) : reject(created?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm khoa, vui lòng đợi...',
      success: (data: Faculty) => {
        // Check
        if (faculties.length === 10 && pageConfig) {
          // Add page
          setPageConfig({ ...pageConfig, pages: pageConfig?.pages + 1 });
        }

        // Add new data
        setFaculties([...faculties, data]);

        // Show message
        return 'Thêm khoa thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Reset form value
        form.reset();
      },
    });
  }

  // Next page
  const nextPage = () => setPage(page + 1);

  // Next page
  const previousPage = () => setPage(page - 1);

  // Load faculties with page
  const loadFaculties = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/faculty/page',
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

  const handleDelete = async (ids: string[]) => {
    // Fetch
    const fetch = await fetcher({
      method: 'DELETE',
      url: `/faculty/delete`,
      payload: { ids },
    });

    // Check request
    fetch?.ok && setHandled(['DELETE', ids.length > 1 ? 1 : 0, ids]);

    // Check success
    return fetch?.ok;
  };

  const deleteFaculty = async (row: Row<Faculty>) => {
    // Promise
    const promise = (): Promise<void> => {
      // Promise
      return new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Deleting
          const deleted = await handleDelete([row.original.id]);

          // Resolve
          deleted ? resolve(deleted) : reject(deleted);
        }, 1000),
      );
    };

    // Toasts
    toast.promise(promise, {
      loading: `Đang xóa khoa ${row.original.name}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (faculties.length === 1 && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa khoa ${row.original.name} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Dowload Excel
  const downloadExcel = async () => {
    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/faculty/all',
    });

    // Check success
    if (fetch?.ok) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Faculty');

      // Thêm dữ liệu từ JSON vào worksheet
      worksheet.columns = [
        { header: 'Mã khoa', key: 'identifier_id' },
        { header: 'Tên khoa', key: 'name' },
        { header: 'Mô tả', key: 'desc' },
        { header: 'Ngày tạo', key: 'created_at' },
        { header: 'Ngày cập nhật gần nhất', key: 'updated_at' },
      ];

      // Map data
      fetch?.data.forEach((item: Faculty) => {
        worksheet.addRow({
          identifier_id: item.identifier_id,
          name: item.name,
          desc: item.desc,
          created_at: format(item.created_at, 'dd/MM/yyyy'),
          updated_at: format(item.updated_at, 'dd/MM/yyyy'),
        });
      });

      // Lưu workbook vào một file Excel
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'faculty.xlsx');
      });
    }
  };

  // Delete faculties (Multiple)
  const deleteFaculties = async (e: MouseEvent, rows: Row<Faculty>[]) => {
    // Stop Event
    e.preventDefault();

    // Get deletes
    const deletes = rows.map((row) => row.original.id);

    // Promise
    const promise = (): Promise<void> => {
      // Promise
      return new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Deleting
          const deleted = await handleDelete(deletes);

          // Resolve
          deleted ? resolve(deleted) : reject(deleted);
        }, 1000),
      );
    };

    // Toasts
    toast.promise(promise, {
      loading: 'Đang xóa các khoa, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (faculties.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các khoa đã chọn thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  const columns: ColumnDef<Faculty>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        <div className="">{row.getValue('identifier_id')}</div>
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
      accessorKey: 'desc',
      header: () => (
        <Button className="w-full" variant="ghost">
          <div className="flex justify-start flex-1 w-100">
            <p>Mô tả</p>
          </div>
        </Button>
      ),
      cell: ({ row }) => {
        // Des
        const desc: string = row.getValue('desc');

        // Return
        return (
          <div className="text-left">
            {desc?.trim() !== '' ? desc : 'Không có mô tả nào cho khoa'}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày tạo
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {format(row.getValue('created_at'), 'dd/MM/yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Lần cập nhật gần nhất
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {format(row.getValue('updated_at'), 'dd/MM/yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: () => null,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center border-l border-base-300">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={loadingUpdateFaculty}
                      className={`w-full font-normal justify-start relative 
                                        flex cursor-default select-none items-center 
                                        rounded-sm px-2 py-1.5 text-sm outline-none 
                                        transition-colors focus:bg-accent 
                                        focus:text-accent-foreground 
                                        data-[disabled]:pointer-events-none 
                                        data-[disabled]:opacity-50`}
                      variant="ghost"
                    >
                      {loadingUpdateFaculty && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cập nhật
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <UpdateForm
                      row={row}
                      faculties={faculties}
                      setHandled={setHandled}
                      setFaculties={setFaculties}
                      loadingUpdateFaculty={loadingUpdateFaculty}
                      setLoadingUpdateFaculty={setLoadingUpdateFaculty}
                    />
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className={`w-full font-normal justify-start relative 
                                        flex cursor-default select-none items-center 
                                        rounded-sm px-2 py-1.5 text-sm outline-none 
                                        transition-colors focus:bg-accent 
                                        focus:text-accent-foreground 
                                        data-[disabled]:pointer-events-none 
                                        data-[disabled]:opacity-50`}
                      variant="ghost"
                    >
                      Xem
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <ViewDetail id={row.original.id} />
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem onClick={() => deleteFaculty(row)}>
                  Xoá
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
      columnPinning: {
        right: ['actions'],
        left: ['select'],
      },
    },
  });

  // Effect load faculties
  useEffect(() => {
    (async () => await loadFaculties(page))();
  }, [page, isPageChange]);

  // Return
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-hidden">
      <Tabs defaultValue="all" className="overflow-auto">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">EAUT</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <AlertDialog onOpenChange={setDeleteRowDilog} open={deleteRowDilog}>
              <AlertDialogTrigger asChild>
                {rowSelection && Object.keys(rowSelection).length > 0 && (
                  <Button size="sm" variant="destructive" className="h-7 gap-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Xoá khoa
                    </span>
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bạn có chắc muốn xoá các khoa đã chọn?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Khi đồng ý sẽ xoá các khoa đã chọn trong bảng.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction onClick={rowDelete}>
                    Đồng ý
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <TableSearch
              columns={columns}
              title="Tìm kiếm khoa"
              handled={handled}
              setHandled={setHandled}
              IdToColumn={IdToColumn}
              source={'faculty'}
              searchFields={['identifier_id', 'name', 'desc']}
            />
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
                      column.id !== 'actions' && (
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
                      )
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              onClick={downloadExcel}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Xuất file Excel
              </span>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm khoa
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Thêm khoa</DialogTitle>
                      <DialogDescription>
                        Thêm khoa vào hệ thống các khoa của trường
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid">
                        <FormField
                          control={form.control}
                          name="identifier_id"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Mã khoa</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mã khoa"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Tên khoa</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tên khoa"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid">
                        <FormField
                          control={form.control}
                          name="desc"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Mô tả</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Mô tả" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Thêm</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
              <CardTitle>Khoa</CardTitle>
              <CardDescription>Danh sách và thông tin các khoa</CardDescription>
            </CardHeader>
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
                    faculties?.length > 0 &&
                    table.getRowModel().rows?.length ? (
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
                            <Empty desc="Không có khoa nào" />
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
                  {pageConfig ? 10 * (page - 1) + faculties.length : 0}
                </strong>{' '}
                trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> khoa
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
