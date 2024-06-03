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
import type Majors from '@/common/interface/Majors';
import Faculty from '@/common/interface/Faculty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MajorsDetail } from '@/common/types/majors/detail';
import { PageConfig } from '@/common/types/page.config.type';
import TableSearch from '@/components/custom/table.search';
import { errors, getCommonPinningStyles } from '@/common/utils/ultils';

const IdToColumn = (key: string) => {
  switch (key) {
    case 'identifier_id':
      return 'Mã ngành';
    case 'name':
      return 'Tên ngành';
    case 'faculty_name':
      return 'Thuộc khoa';
    case 'desc':
      return 'Mô tả';
    case 'created_at':
      return 'Ngày tạo';
    case 'updated_at':
      return 'Ngày cập nhật gần nhất';
  }
};

// Validate Schema
const majorsSchema = z.object({
  name: z.string({ required_error: 'Trường này không được trống' }).min(1, {
    message: 'Tên ngành học là bắt buộc',
  }),
  desc: z.any(),
  faculty_id: z.string({
    required_error: 'Trường ngày là bắt buộc',
  }),
  identifier_id: z
    .string({
      required_error: 'Mã định danh ngành học là bắt buộc',
    })
    .min(1, {
      message: 'Mã định danh ngành học là bắt buộc',
    }),
});

type UpdateFormType = {
  row: Row<Majors>;
  majors: Majors[];
  facultySelect: Faculty[];
  loadingUpdateMajors: boolean;
  setHandled: React.Dispatch<React.SetStateAction<any>>;
  setLoadingUpdateMajors: React.Dispatch<React.SetStateAction<boolean>>;
  setMajors: React.Dispatch<React.SetStateAction<Majors[]>>;
};

const UpdateForm: FC<UpdateFormType> = ({
  row,
  majors,
  facultySelect,
  setMajors,
  setHandled,
  loadingUpdateMajors,
  setLoadingUpdateMajors,
}) => {
  // Form update Majors
  const formUpdate = useForm<z.infer<typeof majorsSchema>>({
    resolver: zodResolver(majorsSchema),
    defaultValues: {
      name: row.original.name,
      desc: row.original.desc,
      identifier_id: row.original.identifier_id,
      faculty_id: JSON.stringify(
        facultySelect.find((_) => _.id === row.original.faculty_id),
      ),
    },
  });

  // Update
  function onUpdate(values: z.infer<typeof majorsSchema>) {
    // Destructuring data
    const { faculty_id, ...vals } = values;

    // Faculty data
    const faculty = JSON.parse(faculty_id);

    // Close dialog
    setLoadingUpdateMajors(true);

    // Promise
    const promise = (): Promise<Majors> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const updated = await fetcher({
            method: 'PUT',
            url: '/majors/update',
            payload: {
              ...vals,
              id: row.original.id,
              faculty_id: faculty.id,
              faculty_name: faculty.name,
            },
          });

          // Check request
          updated?.ok ? resolve(updated?.data) : reject(updated?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật thông tin ngành học, vui lòng đợi...',
      success: (data: Majors) => {
        // Update data
        const updatedItems = majors.map((item: Majors, i: number) => {
          // Check row index
          if (i === row.index) return data;

          // Return
          return item;
        });

        // Set data
        setHandled(['UPDATE', row.index, data]);

        // Set data
        setMajors(updatedItems);

        // Show message
        return 'Cập nhật thông tin ngành học thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Disable loading
        setLoadingUpdateMajors(false);

        // Reset form value
        formUpdate.reset();
      },
    });
  }

  return (
    <Form {...formUpdate}>
      <form onSubmit={formUpdate.handleSubmit(onUpdate)}>
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin của ngành học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin ngành học {row.original.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="identifier_id"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Mã ngành học</FormLabel>
                  <FormControl>
                    <Input placeholder="Mã ngành học" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="faculty_id"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Khoa</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={row.original?.faculty?.name}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {facultySelect.map((item: Faculty) => (
                        <SelectItem key={item.id} value={JSON.stringify(item)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FormLabel htmlFor="text">Tên ngành học</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên ngành học" type="text" {...field} />
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
          <Button disabled={loadingUpdateMajors} type="submit">
            {loadingUpdateMajors && (
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
  const [detail, setDetail] = useState<MajorsDetail | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect load detail
  useEffect(() => {
    (async () => {
      // Fetch
      const loaded = await fetcher({
        method: 'GET',
        url: '/majors/statistical',
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
        <DialogTitle>Chi tiết ngành</DialogTitle>
        <DialogDescription>
          Xem thông tin chi tiết, và thống kê của ngành
        </DialogDescription>
      </DialogHeader>
      {!isLoading ? (
        detail && (
          <Fragment>
            <div>
              <p className="text-sm font-medium">Thống kê</p>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <p className="text-sm">Ngành chính:</p>
                  <p className="text-sm">Ngành thứ 2:</p>
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <p>{detail.mm_students} sinh viên</p>
                  <p>{detail.em_students} sinh viên</p>
                </div>
              </div>
            </div>
            <Separator className="my-1" />
            <div>
              <p className="text-sm font-medium">Thông tin</p>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <p className="text-sm">Mã ngành:</p>
                  <p className="text-sm">Tên ngành:</p>
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
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
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
                  <Skeleton className="w-full h-[20px]" />
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <Skeleton className="w-full h-[20px]" />
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

export default function Majors() {
  // Form
  const form = useForm<z.infer<typeof majorsSchema>>({
    resolver: zodResolver(majorsSchema),
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

  // Faculty select data
  const [facultySelect, setFacultySelect] = useState<Faculty[]>([]);

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Dialog Create
  const [open, setOpen] = useState<boolean>(false);

  // Dialog Create
  const [loadingUpdateMajors, setLoadingUpdateMajors] =
    useState<boolean>(false);

  // Majors list
  const [majors, setMajors] = useState<Majors[]>([]);

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

    // Delete majors
    deletesMajors(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  // Submit
  function onSubmit(values: z.infer<typeof majorsSchema>) {
    // Destructuring data
    const { faculty_id, ...vals } = values;

    // Faculty data
    const faculty = JSON.parse(faculty_id);

    // Close dialog
    setOpen(false);

    // Promise
    const promise = (): Promise<Majors> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const created = await fetcher({
            method: 'POST',
            url: '/majors/create',
            payload: {
              ...vals,
              identifier_id: vals.identifier_id.trim(),
              faculty_id: faculty.id,
              faculty_name: faculty.name,
            },
          });

          // Check request
          created?.ok ? resolve(created?.data) : reject(created?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm ngành học, vui lòng đợi...',
      success: (data: Majors) => {
        // Check
        if (majors.length === 10 && pageConfig) {
          // Add page
          setPageConfig({ ...pageConfig, pages: pageConfig?.pages + 1 });
        }

        // Add new data
        setMajors([...majors, data]);

        // Show message
        return 'Thêm ngành học thành công';
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

  // Load majors with page
  const loadMajors = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/majors/page',
      payload: { page },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to Majors
      setMajors(data);

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
      url: `/majors/delete`,
      payload: { ids },
    });

    // Check request
    fetch?.ok && setHandled(['DELETE', ids.length > 1 ? 1 : 0, ids]);

    // Check success
    return fetch?.ok;
  };

  const deleteMajors = async (row: Row<Majors>) => {
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
      loading: `Đang xóa ngành học ${row.original.name}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (majors.length === 1 && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa ngành học ${row.original.name} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Dowload Excel
  const downloadExcel = async () => {
    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/majors/all',
    });

    // Check success
    if (fetch?.ok) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Majors');

      // Thêm dữ liệu từ JSON vào worksheet
      worksheet.columns = [
        { header: 'Mã ngành học', key: 'identifier_id' },
        { header: 'Tên ngành học', key: 'name' },
        { header: 'Mô tả', key: 'desc' },
        { header: 'Ngày tạo', key: 'created_at' },
        { header: 'Ngày cập nhật gần nhất', key: 'updated_at' },
      ];

      // Map data
      fetch?.data.forEach((item: Majors) => {
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
        saveAs(blob, 'majors.xlsx');
      });
    }
  };

  // Delete majors (Multiple)
  const deletesMajors = async (e: MouseEvent, rows: Row<Majors>[]) => {
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
      loading: 'Đang xóa các ngành học, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (majors.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các ngành học đã chọn thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  const columns: ColumnDef<Majors>[] = [
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
            Mã ngành học
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">{row.getValue('identifier_id')}</div>
      ),
    },
    {
      accessorKey: 'faculty_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Thuộc khoa
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.original.faculty?.name}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tên ngành
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
            {desc?.trim() !== '' ? desc : 'Không có mô tả nào cho ngành học'}
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
          Ngày cập nhật gần nhất
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
                      disabled={loadingUpdateMajors}
                      className={`w-full font-normal justify-start relative 
                                        flex cursor-default select-none items-center 
                                        rounded-sm px-2 py-1.5 text-sm outline-none 
                                        transition-colors focus:bg-accent 
                                        focus:text-accent-foreground 
                                        data-[disabled]:pointer-events-none 
                                        data-[disabled]:opacity-50`}
                      variant="ghost"
                    >
                      {loadingUpdateMajors && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cập nhật
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <UpdateForm
                      row={row}
                      majors={majors}
                      setMajors={setMajors}
                      setHandled={setHandled}
                      facultySelect={facultySelect}
                      loadingUpdateMajors={loadingUpdateMajors}
                      setLoadingUpdateMajors={setLoadingUpdateMajors}
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
                <DropdownMenuItem onClick={() => deleteMajors(row)}>
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
    data: majors,
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

  // Effect load majors
  useEffect(() => {
    (async () => await loadMajors(page))();
  }, [page, isPageChange]);

  // Effect load faculty select
  useEffect(() => {
    (async () => {
      // Fetch
      const fetch = await fetcher({
        method: 'GET',
        url: '/faculty/all',
      });

      // Check success
      if (fetch?.ok) {
        // Set data
        setFacultySelect(fetch?.data);
      }
    })();
  }, []);

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
                      Xoá ngành học
                    </span>
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bạn có chắc muốn xoá các ngành học đã chọn?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Khi đồng ý sẽ xoá các ngành học đã chọn trong bảng.
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
              title="Tìm kiếm ngành"
              handled={handled}
              setHandled={setHandled}
              IdToColumn={IdToColumn}
              source={'majors'}
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
                    Thêm ngành học
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Thêm ngành học</DialogTitle>
                      <DialogDescription>
                        Thêm ngành học vào hệ thống của trường
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid">
                        <FormField
                          control={form.control}
                          name="identifier_id"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Mã ngành học</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mã ngành học"
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
                          name="faculty_id"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Khoa</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn khoa" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {facultySelect.map((item: Faculty) => (
                                    <SelectItem
                                      key={item.id}
                                      value={JSON.stringify(item)}
                                    >
                                      {item.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <FormLabel htmlFor="text">
                                Tên ngành học
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tên ngành học"
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
              <CardTitle>Ngành học</CardTitle>
              <CardDescription>
                Danh sách và thông tin các ngành học
              </CardDescription>
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
                    majors?.length > 0 && table.getRowModel().rows?.length ? (
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
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <div className="py-4">
                            <Empty desc="Không có ngành học nào" />
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
                  {pageConfig ? 10 * (page - 1) + majors.length : 0}
                </strong>{' '}
                trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> ngành
                học
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
