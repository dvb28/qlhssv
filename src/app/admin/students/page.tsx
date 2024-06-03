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
import { toast } from 'sonner';
import { fetcher } from '@/common/utils/fetcher';
import { MouseEvent, useEffect, useState } from 'react';
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
import Link from 'next/link';
import { GenderEnum, GenderToString } from '@/common/enum/gender.enum';
import type Students from '@/common/interface/Students';
import { StateToString, StudyStateEnum } from '@/common/enum/study.state.enum';
import { NationEnum, NationToString } from '@/common/enum/nation.enum';
import { errors, getCommonPinningStyles } from '@/common/utils/ultils';
import { Badge } from '@/components/ui/badge';
import { RankEnum, RankToString } from '@/common/enum/rank.enum';
import { PageConfig } from '@/common/types/page.config.type';
import StudentTableSearch from './search';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

enum ApproveSearchEnum {
  BOTH = 'BOTH',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

const IdToColumn = (key: string) => {
  switch (key) {
    case 'fullname':
      return 'Tên sinh viên';
    case 'gender':
      return 'Giới tính';
    case 'date_of_birth':
      return 'Ngày sinh';
    case 'place_of_birth':
      return 'Nơi sinh';
    case 'main_majors':
      return 'Chuyên ngành chính';
    case 'classes_name':
      return 'Lớp học';
    case 'email':
      return 'Địa chỉ Email';
    case 'nationality':
      return 'Quốc tịch';
    case 'nation':
      return 'Quốc gia';
    case 'religion':
      return 'Tôn giáo';
    case 'cccd':
      return 'Căn cước công dân';
    case 'state':
      return 'Trạng thái học';
    case 'phone':
      return 'Số điện thoại';
    case 'home_town':
      return 'Quê quán';
    case 'approve':
      return 'Trạng thái xét duyệt';
    case 'created_at':
      return 'Ngày tạo';
    case 'updated_at':
      return 'Ngày cập nhật gần nhất';
  }
};

export default function Students() {
  // Page
  const [page, setPage] = useState<number>(1);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Handled
  const [handled, setHandled] = useState<any>();

  // Approve state
  const [approveState, setApproveState] = useState<string>(
    ApproveSearchEnum.BOTH,
  );

  // Dialog Open
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Students list
  const [students, setStudents] = useState<Students[]>([]);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  // Handle set approve
  const handleSetApprove = (val: string) => {
    // Set approve
    setApproveState(val);
  };

  // Approve student
  const handleApprove = async (row: Row<Students>) => {
    // Promise
    const promise = (): Promise<Students> => {
      // Promise
      return new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Deleting
          const approved = await fetcher({
            method: 'PUT',
            url: `/students/approve`,
            payload: { id: row.original.id },
          });

          // Resolve
          approved ? resolve(approved?.data) : reject(approved?.message);
        }, 1000),
      );
    };

    // Toasts
    toast.promise(promise, {
      loading: `Đang duyệt hồ sơ sinh viên ${row.original.fullname}, vui lòng đợi...`,
      success: (data: Students) => {
        // Update data
        const updatedItems = students.map((item: Students, i: number) => {
          // Check row index
          if (i === row.index) return data;

          // Return
          return item;
        });

        // Set data
        setHandled(['UPDATE', row.index, data]);

        // Set data
        setStudents(updatedItems);

        // Show message
        return `Duyệt hồ sơ sinh viên ${row.original.fullname} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  const handleDelete = async (ids: string[]) => {
    // Fetch
    const fetch = await fetcher({
      method: 'DELETE',
      url: `/students/delete`,
      payload: { ids },
    });

    // Check request
    fetch?.ok && setHandled(['DELETE', ids.length > 1 ? 1 : 0, ids]);

    // Check success
    return fetch?.ok;
  };

  const deleteStudents = async (row: Row<Students>) => {
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
      loading: `Đang xóa sinh viên ${row.original.fullname}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (students.length === 1 && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa sinh viên ${row.original.fullname} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  const columns: ColumnDef<Students>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="pr-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="pr-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'msv',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Mã sinh viên
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // MSV
        const msv: string = row.getValue('msv');

        // Return
        return (
          <div>
            {msv?.length > 0 ? (
              msv
            ) : (
              <Badge variant="destructive">Chưa được cấp</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'fullname',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tên sinh viên
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue('fullname')}</div>,
    },
    {
      accessorKey: 'approve',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Trạng thái xét duyệt
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Value
        const isApprove = row.getValue('approve');

        // Return
        return (
          <Badge variant={isApprove ? 'success' : 'destructive'}>
            {isApprove ? 'Đã xét duyệt' : 'Chưa xét duyệt'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Giới tính
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Original Gender
        const originalGender = row.getValue('gender');

        // Convert Gender
        const gender =
          originalGender !== GenderEnum.FEMALE
            ? originalGender === GenderEnum.OTHER
              ? 'Khác'
              : 'Nam'
            : 'Nữ';
        // Return
        return <div className="">{gender}</div>;
      },
    },
    {
      accessorKey: 'state',
      header: () => (
        <Button className="w-full" variant="ghost">
          <div className="flex justify-start flex-1 w-100">
            <p>Trạng thái học</p>
          </div>
        </Button>
      ),
      cell: ({ row }) => {
        // Value
        const value: StudyStateEnum = row.getValue('state');

        // Return
        return (
          value && (
            <div className="text-left">
              <Badge
                variant={
                  value === StudyStateEnum.ACCEPTED
                    ? 'success'
                    : value === StudyStateEnum.REJECTED
                    ? 'destructive'
                    : value === StudyStateEnum.NOTYET
                    ? 'default'
                    : 'amber'
                }
              >
                {StateToString(value)}
              </Badge>
            </div>
          )
        );
      },
    },
    {
      accessorKey: 'date_of_birth',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày sinh
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div className="text-left">{row.getValue('date_of_birth')}</div>;
      },
    },
    {
      accessorKey: 'place_of_birth',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nơi sinh
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">{row.getValue('place_of_birth')}</div>
        );
      },
    },
    {
      accessorKey: 'main_majors',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Chuyên ngành chính
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">
          {row.original.mmr?.name ?? (
            <p className="text-red-500 font-medium">Chưa có chuyên ngành</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'classes.name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Lớp học
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-nowrap">{row.original.classes?.name}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Địa chỉ Email
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'nationality',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Quốc tịch
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">{NationToString(row.getValue('nationality'))}</div>
      ),
    },
    {
      accessorKey: 'nation',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Quốc gia
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">{NationToString(row.getValue('nation'))}</div>
      ),
    },
    {
      accessorKey: 'religion',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tôn giáo
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue('religion')}</div>,
    },
    {
      accessorKey: 'cccd',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Căn cước công dân
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue('cccd')}</div>,
    },
    {
      accessorKey: 'phone',
      header: () => (
        <Button className="w-full" variant="ghost">
          <div className="flex justify-start flex-1 w-100">
            <p>Số điện thoại</p>
          </div>
        </Button>
      ),
      cell: ({ row }) => {
        return <div className="text-left">{row.getValue('phone')}</div>;
      },
    },
    {
      accessorKey: 'home_town',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Quê quán
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div className="text-left">{row.getValue('home_town')}</div>;
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
                <Link
                  href={{
                    pathname: `/admin/students/student-detail`,
                    query: {
                      id: row.original.id,
                    },
                  }}
                >
                  <DropdownMenuItem>Xem</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => deleteStudents(row)}>
                  Xoá
                </DropdownMenuItem>
                {!row.original.approve && (
                  <DropdownMenuItem onClick={() => handleApprove(row)}>
                    Duyệt
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Table
  const table = useReactTable({
    data: students,
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

  // Handle filter approve
  const handleFilterApprove = () => {
    // Change page
    setIsPageChange((prev) => !prev);
  };

  // Row delete
  const rowDelete = (e: MouseEvent) => {
    // Stop default
    e.preventDefault();

    // Delete students
    deletesStudents(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  // Next page
  const nextPage = () => setPage(page + 1);

  // Next page
  const previousPage = () => setPage(page - 1);

  // Load students with page
  const loadStudents = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/students/page',
      payload: { page, approve: approveState },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to students
      setStudents(data);

      // Set page config
      setPageConfig(pageConfig);
    }

    // Disable loading
    setIsLoading(false);
  };

  // Dowload Excel
  const downloadExcel = async () => {
    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/students/all',
    });

    // Check success
    if (fetch?.ok) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('students');

      // Thêm dữ liệu từ JSON vào worksheet
      worksheet.columns = [
        { header: 'Mã sinh viên', key: 'msv' },
        { header: 'Tên sinh viên', key: 'fullname' },
        { header: 'Địa chỉ Email', key: 'email' },
        { header: 'Căn cước công dân', key: 'cccd' },
        { header: 'Ngày sinh', key: 'date_of_birth' },
        { header: 'Giới tính', key: 'gender' },
        { header: 'Lớp học', key: 'classes' },
        { header: 'Nơi sinh', key: 'place_of_birth' },
        { header: 'Tôn giáo', key: 'religion' },
        { header: 'Quốc tịch', key: 'nationality' },
        { header: 'Quốc gia', key: 'nation' },
        { header: 'Số điện thoại', key: 'phone' },
        { header: 'Trạng thái đi học', key: 'state' },
        { header: 'Xếp loại học tập THPT', key: 'study_rank' },
        { header: 'Xếp loại hạnh kiểm THPT', key: 'morality_rank' },
        { header: 'Xếp loại tốt nghiệp THPT', key: 'graduate_rank' },
        { header: 'Năm tốt nghiệp THPT', key: 'graduate_year' },
        { header: 'Tên bố', key: 'father_name' },
        { header: 'Tên mẹ', key: 'mother_name' },
        { header: 'Ngày sinh của bố', key: 'father_date_of_birth' },
        { header: 'Ngày sinh của mẹ', key: 'mother_date_of_birth' },
        { header: 'Quê quán', key: 'home_town' },
        { header: 'Hệ đào tạo', key: 'hdt' },
        { header: 'Chuyên ngành chính', key: 'main_majors' },
        { header: 'Ngành thứ 2', key: 'extra_majors' },
        { header: 'Số báo danh', key: 'sbd' },
        { header: 'Khối dự thi', key: 'block' },
        { header: 'Khu vực', key: 'area' },
        { header: 'Ngành tuyển sinh', key: 'admissions_industry' },
        { header: 'Điểm môn 1', key: 'suj_score_1' },
        { header: 'Điểm môn 2', key: 'suj_score_2' },
        { header: 'Điểm môn 3', key: 'suj_score_3' },
        { header: 'Điểm cộng', key: 'plus_score' },
        { header: 'Điểm tổng', key: 'total_score' },
        { header: 'Lần thi', key: 'count' },
        { header: 'Ngày tạo', key: 'created_at' },
        { header: 'Ngày cập nhật gần nhất', key: 'updated_at' },
      ];

      // Map data
      fetch?.data.forEach((item: Students) => {
        worksheet.addRow({
          ...item,
          msv: item?.msv ? item.msv : 'Chưa được cấp',
          approveState: item?.approve ? 'Đã xét duyệt' : 'Chưa xét duyệt',
          state: StateToString(item?.state as StudyStateEnum),
          gender: GenderToString(item?.gender as GenderEnum),
          nationality: NationToString(item?.nationality as NationEnum),
          nation: NationToString(item?.nation as NationEnum),
          graduate_rank: RankToString(item?.graduate_rank as RankEnum),
          morality_rank: RankToString(item?.morality_rank as RankEnum),
          study_rank: RankToString(item?.study_rank as RankEnum),
          date_of_birth: item?.date_of_birth,
          father_date_of_birth: item?.father_date_of_birth,
          mother_date_of_birth: item?.mother_date_of_birth,
          main_majors: item?.mmr ? item.mmr.name : '',
          extra_majors: item?.emr ? item.emr.name : '',
          classes: item?.classes ? item.classes.name : '',
          created_at: format(item.created_at, 'dd/MM/yyyy'),
          updated_at: format(item.updated_at, 'dd/MM/yyyy'),
        });
      });

      // Lưu workbook vào một file Excel
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'students.xlsx');
      });
    }
  };

  // Delete students (Multiple)
  const deletesStudents = async (e: MouseEvent, rows: Row<Students>[]) => {
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
      loading: 'Đang xóa các sinh viên, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (students.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các sinh viên đã chọn thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Effect load students
  useEffect(() => {
    (async () => await loadStudents(page))();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                      Xoá sinh viên
                    </span>
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bạn có chắc muốn xoá các sinh viên đã chọn?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Khi đồng ý sẽ xoá các sinh viên đã chọn trong bảng.
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
            <StudentTableSearch
              columns={columns}
              title="Tìm kiếm ngành"
              handled={handled}
              setHandled={setHandled}
              IdToColumn={IdToColumn}
              source={'students'}
              searchFields={[
                'fullname',
                'email',
                'religion',
                'phone',
                'father_name',
                'mother_name',
                'place_of_birth',
                'cccd',
              ]}
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
            <Link href="/admin/students/student-add">
              <Button size="sm" className="h-7 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm sinh viên
                </span>
              </Button>
            </Link>
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <div className="flex justify-between">
              <CardHeader>
                <CardTitle>Sinh viên</CardTitle>
                <CardDescription>
                  Danh sách và thông tin các sinh viên
                </CardDescription>
              </CardHeader>
              <div className="flex w-full max-w-sm items-center justify-end gap-1.5 mr-[20px]">
                <Select
                  value={approveState}
                  onValueChange={handleSetApprove}
                  defaultValue={ApproveSearchEnum.BOTH}
                >
                  <SelectTrigger className="w-[210px] max-md:w-full">
                    <SelectValue placeholder="Lọc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      key={ApproveSearchEnum.BOTH}
                      value={ApproveSearchEnum.BOTH}
                    >
                      Chưa duyệt và đã duyệt
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
                <Button className="w-[40px] px-2" onClick={handleFilterApprove}>
                  Lọc
                </Button>
              </div>
            </div>
            <CardContent className="overflow-x-auto">
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
                    students?.length > 0 && table.getRowModel().rows?.length ? (
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
                            <Empty desc="Không có sinh viên nào" />
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
                  {pageConfig ? 10 * (page - 1) + students.length : 0}
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
