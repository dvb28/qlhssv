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
import { CaretSortIcon } from '@radix-ui/react-icons';
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
import Faculty from '@/common/interface/Faculty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Class from '@/common/interface/Class';
import Course from '@/common/interface/Course';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { ClassDetail } from '@/common/types/class/detail';
import { PageConfig } from '@/common/types/page.config.type';

const IdToColumn = (key: string) => {
  switch (key) {
    case 'identifier_id':
      return 'Mã lớp';
    case 'name':
      return 'Tên lớp';
    case 'course_name':
      return 'Thuộc khoá học';
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

const columns: ColumnDef<Class>[] = [
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
          Mã lớp học
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue('identifier_id')}</div>,
  },
  {
    accessorKey: 'course_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Thuộc khoá học
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      // Return
      return <div className="">{row.original.course?.name}</div>;
    },
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
          Tên lớp
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
          {desc?.trim() !== '' ? desc : 'Không có mô tả nào cho lớp học'}
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
];

// Validate Schema
const classSchema = z.object({
  name: z.string({ required_error: 'Trường này không được trống' }).min(1, {
    message: 'Tên lớp học là bắt buộc',
  }),
  desc: z.any(),
  faculty_id: z.string({
    required_error: 'Trường này là bắt buộc',
  }),
  course_id: z.string({
    required_error: 'Trường ngày là bắt buộc',
  }),
  identifier_id: z
    .string({
      required_error: 'Mã định danh lớp học là bắt buộc',
    })
    .min(1, {
      message: 'Mã định danh lớp học là bắt buộc',
    }),
});


type UpdateFormType = {
  row: Row<Class>;
  classess: Class[];
  facultySelect: Faculty[];
  courseSelect: Course[];
  setOpenUpdateClass: React.Dispatch<React.SetStateAction<boolean>>;
  setClassess: React.Dispatch<React.SetStateAction<Class[]>>;
};

const UpdateForm: FC<UpdateFormType> = ({
  row,
  classess,
  facultySelect,
  courseSelect,
  setClassess,
  setOpenUpdateClass,
}) => {
  // Form update classess
  const formUpdate = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: row.getValue('name'),
      desc: row.getValue('desc'),
      identifier_id: row.getValue('identifier_id'),
      faculty_id: JSON.stringify(
        facultySelect.find((_: Faculty) => _.id === row.original.faculty_id),
      ),
      course_id: JSON.stringify(
        courseSelect.find((_: Course) => _.id === row.original.course_id),
      ),
    },
  });

  // Update
  function onUpdate(values: z.infer<typeof classSchema>) {
    // Destructuring data
    const { faculty_id, course_id, ...vals } = values;

    // Faculty data
    const faculty = JSON.parse(faculty_id);

    // Course data
    const course = JSON.parse(course_id);

    // Close dialog
    setOpenUpdateClass(false);

    // Promise
    const promise = (): Promise<Class> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const updated = await fetcher({
            method: 'PUT',
            url: '/class/update',
            payload: {
              ...vals,
              id: row.original.id,
              identifier_id: row.original.identifier_id.trim(),
              faculty_id: faculty.id,
              course_id: course.id,
            },
          });

          // Check request
          updated?.ok
            ? resolve({
                ...updated?.data,
                faculty: { name: faculty?.name },
                course: { name: course?.name },
              })
            : reject(updated?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật thông tin lớp học, vui lòng đợi...',
      success: (data: Class) => {
        // Update data
        const updatedItems = classess.map((item: Class, i: number) => {
          // Check row index
          if (i === row.index) return data;

          // Return
          return item;
        });

        // Set data
        setClassess(updatedItems);

        // Show message
        return 'Cập nhật thông tin lớp học thành công';
      },
      error: (message: string) => `${message}`,
      finally: () => {
        // Reset form value
        formUpdate.reset();
      },
    });
  }

  return (
    <Form {...formUpdate}>
      <form onSubmit={formUpdate.handleSubmit(onUpdate)}>
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin của lớp học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lớp học {row.original.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid">
            <FormField
              control={formUpdate.control}
              name="identifier_id"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Mã lớp học</FormLabel>
                  <FormControl>
                    <Input placeholder="Mã lớp học" type="text" {...field} />
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
                        <SelectValue placeholder={row.original.faculty?.name} />
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
              name="course_id"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel htmlFor="text">Số khoá học</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={row.original.course?.name} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courseSelect.map((item: Course) => (
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
                  <FormLabel htmlFor="text">Tên lớp học</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên lớp học" type="text" {...field} />
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
          <Button type="submit">Cập nhật</Button>
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
  const [detail, setDetail] = useState<ClassDetail | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect load detail
  useEffect(() => {
    (async () => {
      // Fetch
      const loaded = await fetcher({
        method: 'GET',
        url: '/class/statistical',
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
                  <p className="text-sm">Tổng số sinh viên:</p>
                  <p className="text-sm">Số sinh viên còn đi học:</p>
                  <p className="text-sm">Số sinh viên đã bảo lưu:</p>
                  <p className="text-sm">Số sinh viên đã bỏ học:</p>
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <p>{detail.students} sinh viên</p>
                  <p>{detail.students_accepted} sinh viên</p>
                  <p>{detail.students_pending} sinh viên</p>
                  <p>{detail.students_rejected} sinh viên</p>
                </div>
              </div>
            </div>
            <Separator className="my-1" />
            <div>
              <p className="text-sm font-medium">Thông tin</p>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="flex gap-5 flex-col text-[15px] text-muted-foreground">
                  <p className="text-sm">Mã lớp:</p>
                  <p className="text-sm">Tên lớp:</p>
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
                  <Skeleton className="w-full h-[20px]" />
                </div>
                <div className="flex gap-5 flex-col items-end text-[15px]">
                  <Skeleton className="w-full h-[20px]" />
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

export default function Classess() {
  // Form
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      desc: '',
      identifier_id: '',
    },
  });

  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Faculty select data
  const [facultySelect, setFacultySelect] = useState<Faculty[]>([]);

  // Course select data
  const [courseSelect, setCourseSelect] = useState<Course[]>([]);

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Dialog Create
  const [open, setOpen] = useState<boolean>(false);

  // Dialog Create
  const [openUpdateClass, setOpenUpdateClass] = useState<boolean>(false);

  // Class list
  const [classess, setClassess] = useState<Class[]>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  // Table
  const table = useReactTable({
    data: classess,
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

  // Row delete
  const rowDelete = (e: MouseEvent) => {
    // Stop default
    e.preventDefault();

    // Delete classess
    deletesClass(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  // Submit
  function onSubmit(values: z.infer<typeof classSchema>) {
    // Destructuring data
    const { faculty_id, course_id, ...vals } = values;

    // Faculty data
    const faculty = JSON.parse(faculty_id);

    // Course data
    const course = JSON.parse(course_id);

    // Close dialog
    setOpen(false);

    // Promise
    const promise = (): Promise<Class> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const created = await fetcher({
            method: 'POST',
            url: '/class/create',
            payload: {
              ...values,
              identifier_id: values.identifier_id.trim(),
              faculty_id: faculty.id,
              course_id: course.id,
            },
          });

          // Check request
          created?.ok
            ? resolve({
                ...created?.data,
                course: { name: course.name },
                faculty: { name: faculty.name },
              })
            : reject(created?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm lớp học, vui lòng đợi...',
      success: (data: Class) => {
        // Check
        if (classess.length === 10 && pageConfig) {
          // Add page
          setPageConfig({ ...pageConfig, pages: pageConfig?.pages + 1 });
        }

        // Add new data
        setClassess([...classess, data]);

        // Show message
        return 'Thêm lớp học thành công';
      },
      error: (message: string) => `${message}`,
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

  // Load classess with page
  const loadClass = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/class/page',
      payload: { page },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to classess
      setClassess(data);

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
      url: `/class/delete`,
      payload: { ids },
    });

    // Check success
    return fetch?.ok;
  };

  const deleteClass = async (row: Row<Class>) => {
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
      loading: `Đang xóa lớp học ${row.original.name}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (classess.length === 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa lớp học ${row.original.name} thành công`;
      },
      error: (message: string) => `${message}`,
    });
  };

  // Dowload Excel
  const downloadExcel = async () => {
    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/class/all',
    });

    // Check success
    if (fetch?.ok) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Class');

      // Thêm dữ liệu từ JSON vào worksheet
      worksheet.columns = [
        { header: 'Mã lớp học', key: 'identifier_id' },
        { header: 'Tên lớp học', key: 'name' },
        { header: 'Thuộc khoá học', key: 'course_name' },
        { header: 'Thuộc khoa', key: 'faculty_name' },
        { header: 'Mô tả', key: 'desc' },
        { header: 'Ngày tạo', key: 'created_at' },
        { header: 'Ngày cập nhật gần nhất', key: 'updated_at' },
      ];

      // Map data
      fetch?.data.forEach((item: Class) => {
        worksheet.addRow({
          identifier_id: item.identifier_id,
          name: item.name,
          desc: item.desc,
          course_name: item.course?.name,
          faculty_name: item.faculty?.name,
          created_at: format(item.created_at, 'dd/MM/yyyy'),
          updated_at: format(item.updated_at, 'dd/MM/yyyy'),
        });
      });

      // Lưu workbook vào một file Excel
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'class.xlsx');
      });
    }
  };

  // Delete classess (Multiple)
  const deletesClass = async (e: MouseEvent, rows: Row<Class>[]) => {
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
      loading: 'Đang xóa các lớp học, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (classess.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các lớp học đã chọn thành công';
      },
      error: (message: string) => `${message}`,
    });
  };

  // Effect load classess
  useEffect(() => {
    (async () => await loadClass(page))();
  }, [page, isPageChange]);

  // Effect load faculty select
  useEffect(() => {
    (async () => {
      // Fetch faculty
      const facultySelect = await fetcher({
        method: 'GET',
        url: '/faculty/all',
      });

      // Fetch course
      const courseSelect = await fetcher({
        method: 'GET',
        url: '/course/all',
      });

      // Check faculty success
      facultySelect?.ok && setFacultySelect(facultySelect?.data);

      // Check course success
      courseSelect?.ok && setCourseSelect(courseSelect?.data);
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
                      Xoá lớp học
                    </span>
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bạn có chắc muốn xoá các lớp học đã chọn?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Khi đồng ý sẽ xoá các lớp học đã chọn trong bảng.
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
                    Thêm lớp học
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Thêm lớp học</DialogTitle>
                      <DialogDescription>
                        Thêm lớp học vào hệ thống của trường
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid">
                        <FormField
                          control={form.control}
                          name="identifier_id"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Mã lớp học</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mã lớp học"
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
                          name="course_id"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Khoá học</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn khoá học" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courseSelect.map((item: Course) => (
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
                              <FormLabel htmlFor="text">Tên lớp học</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tên lớp học"
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
              <CardTitle>Lớp học</CardTitle>
              <CardDescription>
                Danh sách và thông tin các lớp học
              </CardDescription>
            </CardHeader>
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
                    classess?.length > 0 && table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={`py-0 ${
                                !cell.id.includes('select') && 'pl-6'
                              }`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="py-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                <Dialog
                                  open={openUpdateClass}
                                  onOpenChange={setOpenUpdateClass}
                                >
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
                                      Cập nhật
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <UpdateForm
                                      row={row}
                                      facultySelect={facultySelect}
                                      courseSelect={courseSelect}
                                      classess={classess}
                                      setClassess={setClassess}
                                      setOpenUpdateClass={setOpenUpdateClass}
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
                                <DropdownMenuItem
                                  onClick={() => deleteClass(row)}
                                >
                                  Xoá
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 1}
                          className="h-24 text-center"
                        >
                          <div className="py-4">
                            <Empty desc="Không có lớp học nào" />
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
                  {pageConfig ? 10 * (page - 1) + classess.length : 0}
                </strong>{' '}
                trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> lớp
                học
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
