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
import { FC, MouseEvent, useEffect, useState } from 'react';
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
import { PageConfig } from '@/common/types/page.config.type';
import { errors, verifyRole } from '@/common/utils/ultils';
import TableSearch from '@/components/custom/table.search';
import type Users from '@/common/interface/Users';
import { Role, RoleToString } from '@/common/enum/role.enum';
import { Badge } from '@/components/ui/badge';
import { Response } from '@/common/types/response.type';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GenderEnum } from '@/common/enum/gender.enum';
import { useSession } from 'next-auth/react';

const IdToColumn = (key: string) => {
  switch (key) {
    case 'name':
      return 'Tên tài khoản';
    case 'desc':
      return 'Email';
    case 'roles':
      return 'Đã tốt nghiệp';
    case 'created_at':
      return 'Ngày tạo';
    case 'updated_at':
      return 'Ngày cập nhật';
  }
};

const columns: ColumnDef<Users>[] = [
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
    accessorKey: 'fullname',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tên tài khoản
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue('fullname')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'roles',
    header: () => (
      <Button className="w-full" variant="ghost">
        <div className="flex justify-start flex-1 w-100">
          <p>Quyền</p>
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      // Roles to split
      const roles: string[] = row.original.roles?.split(' ');

      // Return
      return (
        <div className="">
          {roles?.map((role: string) => {
            // Data
            const data: any = RoleToString(role);

            // Return
            return (
              <Badge variant={data.variant} key={role}>
                {data.label}
              </Badge>
            );
          })}
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
];

// Validate Schema
const usersSchema = z.object({
  roles: z.string({
    required_error: 'Vui lòng chọn quyền hạn.',
  }),
});

type UpdateFormType = {
  row: Row<Users>;
  users: Users[];
  setHandled: React.Dispatch<React.SetStateAction<any>>;
  setOpenUpdateUsers: React.Dispatch<React.SetStateAction<boolean>>;
  setUsers: React.Dispatch<React.SetStateAction<Users[]>>;
};

const UpdateForm: FC<UpdateFormType> = ({
  row,
  users,
  setUsers,
  setHandled,
  setOpenUpdateUsers,
}) => {
  // Form update faculty
  const formUpdate = useForm<z.infer<typeof usersSchema>>({
    resolver: zodResolver(usersSchema),
    defaultValues: {
      roles: row.original.roles,
    },
  });

  // Update
  function onUpdate(values: z.infer<typeof usersSchema>) {
    // Close dialog
    setOpenUpdateUsers(false);

    // Promise
    const promise = (): Promise<Users> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetch
          const updated = await fetcher({
            method: 'PUT',
            url: '/users/update-role',
            payload: {
              ...values,
              id: row.original.id,
            },
          });

          // Check request
          updated?.ok ? resolve(updated?.data) : reject(updated?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang sửa quyền tài khoản, vui lòng đợi...',
      success: (data: Users) => {
        // Update data
        const updatedItems = users.map((item: Users, i: number) => {
          // Check row index
          if (i === row.index) return data;

          // Return
          return item;
        });

        // Set data
        setHandled(['UPDATE', row.index, data]);

        // Set data
        setUsers(updatedItems);

        // Show message
        return 'Sửa quyền tài khoản thành công';
      },
      error: (message: string[]) => errors(toast, message),
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
          <DialogTitle>Cập nhật thông tin của tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài khoản {row.original.fullname}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={formUpdate.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="text">Quyền</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quyền" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Role.MANAGER}>Quản lý</SelectItem>
                    <SelectItem value={Role.USER}>Người dùng</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit">Cập nhật</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Form Schema
const formSchema = z
  .object({
    email: z
      .string({
        required_error: 'Trường này không được trống.',
      })
      .email({
        message: 'Email đã nhập không hợp lệ.',
      }),
    roles: z.string({
      required_error: 'Vui lòng chọn quyền hạn.',
    }),
    password: z
      .string({
        required_error: 'Trường này không được trống.',
      })
      .min(8, {
        message: 'Mật khẩu phải trên 8 ký tự.',
      }),
    confirm: z
      .string({
        required_error: 'Trường này không được trống.',
      })
      .min(8, {
        message: 'Mật khẩu phải trên 8 ký tự.',
      }),
    fullname: z.string().min(10, {
      message: 'Họ và tên phải tên trên 10 ký tự.',
    }),
    gender: z.string({
      required_error: 'Vui lòng chọn giới tính.',
    }),
    phone: z
      .string({
        required_error: 'Trường này không được trống.',
      })
      .min(10, {
        message: 'Vui lòng nhập số điện thoại.',
      })
      .max(10, {
        message: 'Số điện thoại chỉ có 10 số.',
      }),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Mật khẩu không trùng khớp',
    path: ['confirm'],
  });

export default function Users() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullname: '',
      confirm: '',
      phone: '',
      roles: Role.USER,
    },
  });

  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Handled
  const [handled, setHandled] = useState<any>();

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Dialog Create
  const [openUpdateUsers, setOpenUpdateUsers] = useState<boolean>(false);

  // Faculty list
  const [users, setUsers] = useState<Users[]>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // User
  const user = useSession()?.data?.user as Users;

  // Dialog Create
  const [open, setOpen] = useState<boolean>(false);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  // Table
  const table = useReactTable({
    data: users,
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

  // Submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Close dialog
    setOpen(false);

    // Promise
    const promise = (): Promise<Users> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetcher
          const added: Response = await fetcher({
            method: 'POST',
            url: '/users/add',
            payload: {
              ...values,
              avatar: '',
            },
          });

          // Check request
          added?.ok ? resolve(added?.data) : reject(added?.message);
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm tài khoản, vui lòng đợi...',
      success: (data: Users) => {
        // Check
        if (users.length === 10 && pageConfig) {
          // Add page
          setPageConfig({ ...pageConfig, pages: pageConfig?.pages + 1 });
        }

        // Add new data
        setUsers([...users, data]);

        // Show message
        return 'Thêm tài khoản thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Reset form value
        form.reset();
      },
    });
  }

  // Row delete
  const rowDelete = (e: MouseEvent) => {
    // Stop default
    e.preventDefault();

    // Delete users
    deletesUsers(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  // Next page
  const nextPage = () => setPage(page + 1);

  // Next page
  const previousPage = () => setPage(page - 1);

  // Load users with page
  const loadUsers = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/users/page',
      payload: { page },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to faculty
      setUsers(data);

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
      url: `/users/delete`,
      payload: { ids },
    });

    // Check request
    fetch?.ok && setHandled(['DELETE', ids.length > 1 ? 1 : 0, ids]);

    // Check success
    return fetch?.ok;
  };

  const deleteUsers = async (row: Row<Users>) => {
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
      loading: `Đang xóa tài khoản ${row.original.fullname}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (users.length === 1 && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa tài khoản ${row.original.fullname} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Dowload Excel
  const downloadExcel = async () => {
    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/users/all',
    });

    // Check success
    if (fetch?.ok) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Faculty');

      // Thêm dữ liệu từ JSON vào worksheet
      worksheet.columns = [
        { header: 'tài khoản số', key: 'name' },
        { header: 'Mô tả', key: 'desc' },
        { header: 'Ngày tạo', key: 'created_at' },
        { header: 'Ngày cập nhật gần nhất', key: 'updated_at' },
      ];

      // Map data
      fetch?.data.forEach((item: Users) => {
        worksheet.addRow({
          fullname: item.fullname,
          email: item.email,
          created_at: format(item.created_at, 'dd/MM/yyyy'),
          updated_at: format(item.updated_at, 'dd/MM/yyyy'),
        });
      });

      // Lưu workbook vào một file Excel
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'users.xlsx');
      });
    }
  };

  // Delete users (Multiple)
  const deletesUsers = async (e: MouseEvent, rows: Row<Users>[]) => {
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
      loading: 'Đang xóa các tài khoản, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (users.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các tài khoản đã chọn thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Effect load users
  useEffect(() => {
    (async () => await loadUsers(page))();
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
            {verifyRole(
              user?.roles,
              [Role.ADMIN],
              <AlertDialog
                onOpenChange={setDeleteRowDilog}
                open={deleteRowDilog}
              >
                <AlertDialogTrigger asChild>
                  {rowSelection && Object.keys(rowSelection).length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Xoá tài khoản
                      </span>
                    </Button>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Bạn có chắc muốn xoá các tài khoản đã chọn?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Khi đồng ý sẽ xoá các tài khoản đã chọn trong bảng.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={rowDelete}>
                      Đồng ý
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>,
            )}
            <TableSearch
              columns={columns}
              title="Tìm kiếm tài khoản"
              handled={handled}
              setHandled={setHandled}
              IdToColumn={IdToColumn}
              source={'users'}
              searchFields={['name', 'desc']}
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
            {verifyRole(
              user?.roles,
              [Role.ADMIN, Role.MANAGER],
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Thêm tài khoản
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="grid gap-2"
                    >
                      <DialogHeader>
                        <DialogTitle>Thêm tài khoản</DialogTitle>
                        <DialogDescription>
                          Thêm tài khoản vào hệ thống các tài khoản của trường
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="fullname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="text">Họ và tên</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Họ và tên"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="email">Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="your.email@gmail.com"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="roles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="text">Quyền</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn quyền" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {verifyRole(
                                    user?.roles,
                                    [Role.ADMIN],
                                    <SelectItem value={Role.MANAGER}>
                                      Quản lý
                                    </SelectItem>,
                                  )}
                                  <SelectItem value={Role.USER}>
                                    Người dùng
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="password">SĐT</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="SĐT"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="text">Giới tính</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={GenderEnum.MALE}>
                                      Nam
                                    </SelectItem>
                                    <SelectItem value={GenderEnum.FEMALE}>
                                      Nữ
                                    </SelectItem>
                                    <SelectItem value={GenderEnum.OTHER}>
                                      Khác
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full mt-2">
                          Thêm tài khoản
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>,
            )}
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
              <CardTitle>Quản lý tài khoản</CardTitle>
              <CardDescription>
                Danh sách và thông tin các tài khoản
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
                    users?.length > 0 && table.getRowModel().rows?.length ? (
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
                                  open={openUpdateUsers}
                                  onOpenChange={setOpenUpdateUsers}
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
                                      users={users}
                                      setUsers={setUsers}
                                      setHandled={setHandled}
                                      setOpenUpdateUsers={setOpenUpdateUsers}
                                    />
                                  </DialogContent>
                                </Dialog>
                                {verifyRole(
                                  user?.roles,
                                  [Role.ADMIN],
                                  <DropdownMenuItem
                                    onClick={() => deleteUsers(row)}
                                  >
                                    Xoá
                                  </DropdownMenuItem>,
                                )}
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
                            <Empty desc="Không có tài khoản nào" />
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
                  {pageConfig ? 10 * (page - 1) + users.length : 0}
                </strong>{' '}
                trên <strong>{pageConfig ? pageConfig?.total : 0}</strong> khoá
                học
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
