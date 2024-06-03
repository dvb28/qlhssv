'use client';
import {
  CalendarIcon,
  ChevronLeft,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import _ from 'lodash';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChangeEvent,
  FC,
  MouseEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GenderEnum } from '@/common/enum/gender.enum';
import { NationEnum } from '@/common/enum/nation.enum';
import { StudyStateEnum } from '@/common/enum/study.state.enum';
import { HDTEnum } from '@/common/enum/hdt.enum';
import { RankEnum } from '@/common/enum/rank.enum';
import Majors from '@/common/interface/Majors';
import { BASE_URL, fetcher } from '@/common/utils/fetcher';
import Class from '@/common/interface/Class';
import { useRouter } from 'next-nprogress-bar';
import { useSearchParams } from 'next/navigation';
import Students from '@/common/interface/Students';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { StudentsPapersAndCertificate } from '@/common/interface/StudentsPapersAndCertificate';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import Empty from '@/components/ui/empty';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { errors, getCommonPinningStyles } from '@/common/utils/ultils';
import { PageConfig } from '@/common/types/page.config.type';
import Link from 'next/link';

// Form Student Info Schema
const studentInfoSchema = z.object({
  email: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .email({
      message: 'Email đã nhập không hợp lệ.',
    }),
  gender: z.enum([GenderEnum.MALE, GenderEnum.FEMALE, GenderEnum.OTHER], {
    required_error: 'Trường này không được trống.',
  }),
  place_of_birth: z.string().optional(),
  religion: z
    .string({
      required_error: 'Nếu không có tôn giáo hãy nhập "Không"',
    })
    .min(1, {
      message: 'Nếu không có tôn giáo hãy nhập "Không".',
    })
    .optional(),
  fullname: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .min(8, {
      message: 'Tên đầy đủ của sinh viên phải trên 8 ký tự.',
    }),
  home_town: z.string().optional(),
  phone: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  nationality: z.string().optional(),
  nation: z.string().optional(),
  date_of_birth: z.string({
    required_error: 'Trường này không được trống.',
  }),
  cccd: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .length(12, {
      message: 'Căn cước công dân phải có đúng 12 số.',
    }),
  state: z.enum(
    [
      StudyStateEnum.ACCEPTED,
      StudyStateEnum.PENDING,
      StudyStateEnum.REJECTED,
      StudyStateEnum.NOTYET,
    ],
    {
      required_error: 'Trường này không được trống.',
    },
  ),
  hdt: z.enum([HDTEnum.DAIHOC, HDTEnum.CAODANG], {
    required_error: 'Trường này không được trống.',
  }),
  main_majors: z.string({
    required_error: 'Trường này không được trống.',
  }),
  extra_majors: z.string().optional(),
  class_id: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  mother_date_of_birth: z.any(),
  father_date_of_birth: z.any(),
  sbd: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  block: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  admissions_industry: z
    .string({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  area: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .optional(),
  suj_score_1: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .min(0, {
      message: 'Trường này phải >= 0.',
    })
    .max(10, {
      message: 'Trường này phải <= 10.',
    }),
  suj_score_2: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .min(0, {
      message: 'Trường này phải >= 0.',
    })
    .max(10, {
      message: 'Trường này phải <= 10.',
    }),
  suj_score_3: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .min(0, {
      message: 'Trường này phải >= 0.',
    })
    .max(10, {
      message: 'Trường này phải <= 10.',
    }),
  plus_score: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .min(0, {
      message: 'Trường này phải >= 0.',
    })
    .max(10, {
      message: 'Trường này phải <= 10.',
    }),
  total_score: z.number().optional(),
  count: z.number({
    required_error: 'Trường này không được trống.',
  }),
  study_rank: z.string().optional(),
  morality_rank: z.string().optional(),
  graduate_rank: z.string().optional(),
  graduate_year: z.string().optional(),
});

const IdToColumn = (key: string) => {
  switch (key) {
    case 'name':
      return 'Tên giấy tờ';
    case 'is_submit':
      return 'Đã nộp';
    case 'give_back':
      return 'Đã trả';
    case 'submit_note':
      return 'Ghi chú nộp';
    case 'give_back_note':
      return 'Ghi chú trả';
    case 'give_back_date':
      return 'Ngày trả';
    case 'submit_date':
      return 'Ngày nộp';
    case 'created_at':
      return 'Ngày tạo';
    case 'updated_at':
      return 'Lần cập nhật gần nhất';
  }
};

// Form papers and certificates
const spacSchema = z.object({
  name: z
    .string({
      required_error: 'Tên giấy giờ, chứng chỉ không được trống.',
    })
    .min(1, {
      message: 'Tên giấy giờ, chứng chỉ không được trống.',
    }),
  give_back: z.boolean({
    required_error: 'Trường này không được trống',
  }),
  file: z.instanceof(FileList).optional(),
  submit_note: z.any(),
  give_back_note: z.any(),
  give_back_date: z.any(),
});

// Multiple spac
const mulSpacSchema = z.object({
  files: z.instanceof(FileList),
});

export default function StudentDetailWrapper() {
  // Search Params
  const searchParams = useSearchParams();

  // Class select data
  const [D, S] = useState<Students | null>(null);

  // Effect load majors select
  useEffect(() => {
    (async () => {
      // Fetch class
      const studentFetch = await fetcher({
        method: 'GET',
        url: '/students/get',
        payload: {
          id: searchParams.get('id'),
        },
      });

      // Check majors select success
      studentFetch?.ok && S(studentFetch?.data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return
  return D && <StudentDetail studentData={D} />;
}

type UpdateFormType = {
  studentData: Students;
  row: Row<StudentsPapersAndCertificate>;
  spac: StudentsPapersAndCertificate[];
  setSpac: React.Dispatch<React.SetStateAction<StudentsPapersAndCertificate[]>>;
};

const UpdateForm: FC<UpdateFormType> = ({ row, spac, setSpac }) => {
  // Dialog Update
  const [openUpdateSpac, setOpenUpdateSpac] = useState<boolean>(false);

  // Form update faculty
  const formUpdate = useForm<z.infer<typeof spacSchema>>({
    resolver: zodResolver(spacSchema),
    defaultValues: {
      name: row.getValue('name'),
      give_back: row.getValue('give_back'),
      submit_note: row.original?.submit_note ?? '',
      give_back_note: row.original?.give_back_note ?? '',
      give_back_date: row.original?.give_back_date ?? '',
    },
  });

  // File ref
  const fileRef = formUpdate.register('file');

  // Fetch Update
  const fetchUpdate = async (values: z.infer<typeof spacSchema>) => {
    // Fetch
    const updated = await fetcher({
      method: 'PUT',
      url: '/student-papers-and-ceritificate/update',
      payload: {
        id: row.original.id,
        ...values,
      },
    });

    // Return
    return updated;
  };

  // Update
  function onUpdate(values: z.infer<typeof spacSchema>) {
    // Close dialog
    setOpenUpdateSpac(false);

    // Promise
    const promise = (): Promise<StudentsPapersAndCertificate> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Check file
          if (values?.file && values?.file?.length > 0) {
            // Form data
            const formData = new FormData();

            // Append file
            formData.append('files', values.file[0]);

            // Fetch upload
            const upload = await fetcher({
              method: 'UPLOAD',
              url: '/student-papers-and-ceritificate/upload',
              payload: formData,
            });

            // Check upload
            if (upload?.ok) {
              // Fetch
              const updatedWithFile = await fetchUpdate({
                ...values,
                file: upload.data.filename,
              });

              // Check request
              updatedWithFile?.ok
                ? resolve(updatedWithFile?.data)
                : reject(updatedWithFile?.message);
            } else {
              // Reject
              reject(upload?.message);
            }
          } else {
            // Fetch
            const updatedNoFile = await fetchUpdate(values);

            // Check request
            updatedNoFile?.ok
              ? resolve(updatedNoFile?.data)
              : reject(updatedNoFile?.message);
          }
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật thông tin khoa, vui lòng đợi...',
      success: (data: StudentsPapersAndCertificate) => {
        // Update data
        const updatedItems = spac.map(
          (item: StudentsPapersAndCertificate, i: number) => {
            // Check row index
            if (i === row.index) return data;

            // Return
            return item;
          },
        );

        // Set data
        setSpac(updatedItems);

        // Show message
        return 'Cập nhật thông tin khoa thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Reset form value
        formUpdate.reset();
      },
    });
  }

  return (
    <Dialog open={openUpdateSpac} onOpenChange={setOpenUpdateSpac}>
      <DialogTrigger asChild>
        <Button
          className={`
            w-full font-normal justify-start relative 
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
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <FormLabel htmlFor="text">Tên chứng chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tên chứng chỉ"
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
                  control={formUpdate.control}
                  name="submit_note"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <FormLabel htmlFor="text">Ghi chú nộp</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ghi chú nộp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid">
                <FormField
                  control={formUpdate.control}
                  name="give_back_note"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <FormLabel htmlFor="text">Ghi chú trả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ghi chú trả" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid">
                <FormField
                  control={formUpdate.control}
                  name="give_back_date"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <FormLabel>Ngày trả</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Chọn ngày trả</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid">
                <FormField
                  control={formUpdate.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <FormLabel htmlFor="text">Chọn file PDF</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf"
                          placeholder="Chọn file PDF"
                          {...fileRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex">
                <FormField
                  control={formUpdate.control}
                  name="give_back"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0 gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Đã trả lại</FormLabel>
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
      </DialogContent>
    </Dialog>
  );
};

type Props = {
  studentData: Students;
};

const StudentDetail: FC<Props> = ({ studentData }: Props) => {
  // Router
  const navigate = useRouter();

  // Majors select data
  const [majorsSelect, setMajorsSelect] = useState<Majors[]>([]);

  // Class select data
  const [classSelect, setClasssSelect] = useState<Class[]>([]);

  // Spac state
  const [spac, setSpac] = useState<StudentsPapersAndCertificate[]>([]);

  // Page
  const [page, setPage] = useState<number>(1);

  // Open mul spac
  const [openMulSpac, setOpenMulSpac] = useState<boolean>(false);

  // Dialog Open
  const [deleteRowDilog, setDeleteRowDilog] = useState<boolean>(false);

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Page config
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  // Open state
  const [open, setOpen] = useState<boolean>(false);

  // On change page
  const [isPageChange, setIsPageChange] = useState<boolean>(false);

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Table Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Table Selection
  const [rowSelection, setRowSelection] = useState({});

  const handleDelete = async (ids: string[], files?: string[]) => {
    // Fetch
    const fetch = await fetcher({
      method: 'DELETE',
      url: `/student-papers-and-ceritificate/delete`,
      payload: { ids, files },
    });

    // Check success
    return fetch?.ok;
  };

  // Delete spac (Single)
  const deleteSpac = async (row: Row<StudentsPapersAndCertificate>) => {
    // Promise
    const promise = (): Promise<void> => {
      // Promise
      return new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Deleting
          const deleted = await handleDelete(
            [row.original.id],
            [row.original.file],
          );

          // Resolve
          deleted ? resolve(deleted) : reject(deleted);
        }, 1000),
      );
    };

    // Toasts
    toast.promise(promise, {
      loading: `Đang xóa giấy tờ ${row.original.name}, vui lòng đợi...`,
      success: () => {
        // Check deletes length
        if (spac.length === 1 && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return `Xóa giấy tờ ${row.original.name} thành công`;
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  // Delete spac (Multiple)
  const deletesSpac = async (
    e: MouseEvent,
    rows: Row<StudentsPapersAndCertificate>[],
  ) => {
    // Stop Event
    e.preventDefault();

    // Files
    const files = rows.map((row) => row.original.file);

    // Get deletes
    const deletes = rows.map((row) => row.original.id);

    // Promise
    const promise = (): Promise<void> => {
      // Promise
      return new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Deleting
          const deleted = await handleDelete(deletes, files);

          // Resolve
          deleted ? resolve(deleted) : reject(deleted);
        }, 1000),
      );
    };

    // Toasts
    toast.promise(promise, {
      loading: 'Đang xóa các giấy tờ, vui lòng đợi...',
      success: () => {
        // Reset selection
        setRowSelection({});

        // Check deletes length
        if (spac.length === deletes.length && page !== 1) {
          // Load previous page
          setPage(page - 1);
        } else {
          // Load current page
          setIsPageChange(!isPageChange);
        }

        // Show message
        return 'Xóa các giấy tờ đã chọn thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  };

  const columns: ColumnDef<StudentsPapersAndCertificate>[] = [
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
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tên giấy tờ
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'is_submit',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Đã nộp
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <Checkbox checked={row.getValue('is_submit')} />,
    },
    {
      accessorKey: 'give_back',
      header: () => (
        <Button className="w-full" variant="ghost">
          <div className="flex justify-start flex-1 w-100">
            <p>Đã trả</p>
          </div>
        </Button>
      ),
      cell: ({ row }) => <Checkbox checked={row.getValue('give_back')} />,
    },
    {
      accessorKey: 'submit_date',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày nộp
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        // Date
        const date: string = row.getValue('submit_date');

        // Return
        return (
          <div className="text-left">
            {date ? format(date, 'dd/MM/yyyy') : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'give_back_date',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày trả
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        // Date
        const date: string = row.getValue('give_back_date');

        // Return
        return (
          <div className="text-left">
            {date ? format(date, 'dd/MM/yyyy') : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'give_back_note',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ghi chú trả
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Note
        const note: string = row.getValue('give_back_note');

        // Return
        return <div className="text-nowrap">{note ? note : 'Không có  '}</div>;
      },
    },
    {
      accessorKey: 'submit_note',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ghi chú nộp
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Note
        const note: string = row.getValue('submit_note');

        // Return
        return <div className="text-nowrap">{note ? note : 'Không có'}</div>;
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
                <UpdateForm
                  row={row}
                  spac={spac}
                  setSpac={setSpac}
                  studentData={studentData}
                />
                <DropdownMenuItem onClick={() => deleteSpac(row)}>
                  Xoá
                </DropdownMenuItem>
                <Link target="_blank" href={`${BASE_URL}/${row.original.file}`}>
                  <DropdownMenuItem>Xem</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Table
  const table = useReactTable({
    data: spac,
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

  // 1. Define your studentInfoForm.
  const studentInfoForm = useForm<z.infer<typeof studentInfoSchema>>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: {
      fullname: studentData.fullname ?? '',
      email: studentData.email ?? '',
      class_id: studentData?.class_id ?? '',
      date_of_birth: studentData.date_of_birth ?? '',
      gender: (studentData.gender as GenderEnum) ?? '',
      nationality: (studentData?.nationality as NationEnum) ?? '',
      nation: (studentData?.nation as NationEnum) ?? '',
      religion: studentData.religion ?? '',
      home_town: studentData.home_town ?? '',
      place_of_birth: studentData.place_of_birth ?? '',
      cccd: studentData.cccd ?? '',
      father_name: studentData?.father_name ?? '',
      mother_name: studentData?.mother_name ?? '',
      father_date_of_birth: studentData.father_date_of_birth ?? '',
      mother_date_of_birth: studentData.mother_date_of_birth ?? '',
      sbd: studentData.sbd ?? '',
      block: studentData.block ?? '',
      admissions_industry: studentData.admissions_industry ?? '',
      phone: studentData.phone ?? '',
      state: (studentData.state as StudyStateEnum) ?? '',
      hdt: (studentData.hdt as HDTEnum) ?? '',
      main_majors: studentData.main_majors ?? '',
      study_rank: (studentData.study_rank as RankEnum) ?? '',
      morality_rank: (studentData?.morality_rank as RankEnum) ?? '',
      graduate_rank: (studentData.graduate_rank as RankEnum) ?? '',
      graduate_year: studentData.graduate_year ?? '',
      suj_score_1: parseFloat(studentData.suj_score_1) ?? '',
      suj_score_2: parseFloat(studentData.suj_score_2) ?? '',
      suj_score_3: parseFloat(studentData.suj_score_3) ?? '',
      plus_score: parseFloat(studentData.plus_score) ?? '',
      total_score: parseFloat(studentData.total_score) ?? '',
      area: parseInt(studentData.area) ?? '',
      count: parseInt(studentData.count) ?? '',
    },
  });

  // Next page
  const nextPage = () => setPage(page + 1);

  // Next page
  const previousPage = () => setPage(page - 1);

  // 1. Define your spacForm.
  const spacForm = useForm<z.infer<typeof spacSchema>>({
    resolver: zodResolver(spacSchema),
    defaultValues: {
      name: '',
      give_back: false,
    },
  });

  // 1. Define your spacForm.
  const mulSpacForm = useForm<z.infer<typeof mulSpacSchema>>({
    resolver: zodResolver(mulSpacSchema),
  });

  // File ref
  const fileRef = spacForm.register('file');

  // File ref
  const filesRef = mulSpacForm.register('files');

  // Number input change
  const numberInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    name: string | any,
    field: any,
  ) => {
    // Parse float
    const parse = parseFloat(e.target.value);

    // Reset field
    field.onChange(parse);

    // Set valud
    studentInfoForm.setValue(name, parse);
  };

  // Handle goback
  const goback = (e: SyntheticEvent) => {
    // Prevent default
    e.preventDefault();

    // Routing
    navigate?.push('/admin/students');
  };

  // Load students with page
  const loadSpac = async (page: number) => {
    // Enable loading
    setIsLoading(true);

    // Fetch
    const fetch = await fetcher({
      method: 'GET',
      url: '/student-papers-and-ceritificate/page',
      payload: { page },
    });

    // Check success
    if (fetch?.ok) {
      // Destruc
      const { data, ...pageConfig } = fetch.data;

      // Set data to students
      setSpac(data);

      // Set page config
      setPageConfig(pageConfig);
    }

    // Disable loading
    setIsLoading(false);
  };

  // Row delete
  const rowDelete = (e: MouseEvent) => {
    // Stop default
    e.preventDefault();

    // Delete faculties
    deletesSpac(e, table.getSelectedRowModel().flatRows);

    // Close dialog
    setDeleteRowDilog(false);
  };

  function onSubmit(values: z.infer<typeof studentInfoSchema>) {
    // Enable loading
    setIsLoading(true);

    // Promise
    const promise = () =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Resolve
          const created = await fetcher({
            method: 'PUT',
            url: '/students/update',
            payload: {
              ...values,
              id: studentData.id,
              date_of_birth: values.date_of_birth,
              father_date_of_birth: values?.father_date_of_birth,
              mother_date_of_birth: values?.father_date_of_birth,
            },
          });

          // Check success and resolve
          created?.ok ? resolve(created?.data) : reject(created?.message);
        }, 2000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật hồ sơ sinh viên, vui lòng đợi...',
      success: () => {
        // Show message
        return 'Cập nhật hồ sơ sinh viên thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Disable loading
        setIsLoading(false);
      },
    });
  }

  // Fetch Update
  const fetchInsertSpac = async (values: z.infer<typeof spacSchema>) => {
    // Fetch
    const created = await fetcher({
      method: 'POST',
      url: '/student-papers-and-ceritificate/create',
      payload: {
        ...values,
        student_id: studentData.id,
      },
    });

    // Return
    return created;
  };

  // Fetch Update
  const fetchInsertMulSpac = async (files: any) => {
    // Insert certificate
    const inserts = files.map((file: any) => {
      // Filename
      const fileName = file?.filename;

      // Last dot index
      const dotIndex = fileName.lastIndexOf('.');

      // Hyphen index
      const hyphenIndex = fileName.indexOf('-', 1);

      // Return
      return {
        file: `files/spac/${fileName}`,
        is_submit: true,
        give_back: false,
        submit_date: new Date(),
        student_id: studentData.id,
        name: fileName.substring(hyphenIndex + 1, dotIndex),
      };
    });

    // Fetch
    const created = await fetcher({
      method: 'POST',
      url: '/student-papers-and-ceritificate/multiple-create',
      payload: inserts,
    });

    // Return
    return created;
  };

  function onInsertSpac(values: z.infer<typeof spacSchema>) {
    // Promise
    const promise = (): Promise<StudentsPapersAndCertificate> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Check file
          if (values?.file && values?.file?.length > 0) {
            // Form data
            const formData = new FormData();

            // Append file
            formData.append('files', values.file[0]);

            // Fetch upload
            const upload = await fetcher({
              method: 'UPLOAD',
              url: '/student-papers-and-ceritificate/upload',
              payload: formData,
            });

            // Check upload
            if (upload?.ok) {
              // Fetch
              const createdWithFile = await fetchInsertSpac({
                ...values,
                file: upload.data?.[0].filename,
              });

              // Check request
              createdWithFile?.ok
                ? resolve(createdWithFile?.data)
                : reject(createdWithFile?.message);
            } else {
              // Reject
              reject(upload?.message);
            }
          } else {
            // Fetch
            const createdNoFile = await fetchInsertSpac(values);

            // Check request
            createdNoFile?.ok
              ? resolve(createdNoFile?.data)
              : reject(createdNoFile?.message);
          }
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm giấy tờ sinh viên, vui lòng đợi...',
      success: (data: StudentsPapersAndCertificate) => {
        // Close dialog
        setOpen(false);

        // Check
        if (spac.length === 10 && pageConfig) {
          // Add page
          setPageConfig({ ...pageConfig, pages: pageConfig?.pages + 1 });
        }

        // Add new data
        setSpac([...spac, data]);

        // Show message
        return 'Thêm giấy tờ sinh viên thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Reset form value
        spacForm.reset();
      },
    });
  }

  function onInsertMulSpac(values: z.infer<typeof mulSpacSchema>) {
    // Promise
    const promise = (): Promise<StudentsPapersAndCertificate[]> =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Check file
          if (values?.files && values?.files?.length > 0) {
            // Form data
            const formData = new FormData();

            // Append file
            for (let i = 0; i < values?.files?.length; i++) {
              formData.append('files', values?.files[i]);
            }

            // Fetch upload
            const upload = await fetcher({
              method: 'UPLOAD',
              url: '/student-papers-and-ceritificate/upload',
              payload: formData,
            });

            // Check upload
            if (upload?.ok) {
              // Fetch
              const created = await fetchInsertMulSpac(upload.data);

              // Check request
              created?.ok ? resolve(created?.data) : reject(created?.message);
            } else {
              // Reject
              reject(upload?.message);
            }
          }
        }, 1000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang thêm giấy tờ sinh viên, vui lòng đợi...',
      success: () => {
        // Close dialog
        setOpenMulSpac(false);

        // Add page
        setIsPageChange((prev) => !prev);

        // Show message
        return 'Thêm giấy tờ sinh viên thành công';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Reset form value
        mulSpacForm.reset();
      },
    });
  }

  // Effect load majors select
  useEffect(() => {
    (async () => {
      // Fetch majors
      const majorsSelect = await fetcher({
        method: 'GET',
        url: '/majors/all',
      });

      // Fetch class
      const classSelect = await fetcher({
        method: 'GET',
        url: '/class/all',
      });

      // Check majors select success
      majorsSelect?.ok && setMajorsSelect(majorsSelect?.data);

      // Check class select success
      classSelect?.ok && setClasssSelect(classSelect?.data);
    })();
  }, []);

  // Effect load students
  useEffect(() => {
    (async () => await loadSpac(page))();
  }, [page, isPageChange]);

  // Return
  return (
    <main className="w-full grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-hidden">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={goback}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Xem thông tin hồ sơ sinh viên
        </h1>
        <Badge
          variant={studentData?.approve ? 'success' : 'destructive'}
          className="ml-auto sm:ml-0"
        >
          {studentData?.approve === true ? 'Đã xét duyệt' : 'Chưa xét duyệt'}
        </Badge>
      </div>
      <Tabs defaultValue="info" className="overflow-auto">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="spac">Chứng chỉ, giấy tờ</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="info">
          <Form {...studentInfoForm}>
            <form onSubmit={studentInfoForm.handleSubmit(onSubmit)}>
              <div className="grid flex-1 auto-rows-max gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="flex-1 shrink-0 whitespace-nowrap text-lg font-semibold tracking-tight sm:grow-0">
                    Thông tin chi tiết
                  </h3>
                  <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button
                      size="sm"
                      className="h-7 gap-1"
                      type="submit"
                      disabled={isLoading}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Cập nhật hồ sơ sinh viên
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                  <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card x-chunk="dashboard-07-chunk-0">
                      <CardHeader>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                          Mục này sẽ yêu cầu nhập các thông tin cá nhân của sinh
                          viên
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 w-full">
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="fullname"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Họ và tên</FormLabel>
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
                              control={studentInfoForm.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Giới tính
                                  </FormLabel>
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
                            <FormField
                              control={studentInfoForm.control}
                              name="place_of_birth"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Nơi sinh</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nơi sinh" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="religion"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Tôn giáo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Tôn giáo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="date_of_birth"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Ngày sinh</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={'outline'}
                                          className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value &&
                                              'text-muted-foreground',
                                          )}
                                        >
                                          {field?.value ? (
                                            field.value
                                          ) : (
                                            <span>Chọn ngày sinh</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={new Date(field.value)}
                                        onSelect={(e) => {
                                          field.onChange(
                                            format(
                                              new Date(e as Date),
                                              'dd/MM/yyyy',
                                            ),
                                          );
                                        }}
                                        disabled={(date) =>
                                          date > new Date() ||
                                          date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="cccd"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>CCCD</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="CCCD"
                                      type="text"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="home_town"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Quê quán</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Quê quán"
                                      type="text"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Số điện thoại cá nhân</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Số điện thoại cá nhân"
                                      type="text"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="sinhvien.email@gmail.com"
                                      type="text"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Trạng thái
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Trạng thái" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem
                                        value={StudyStateEnum.ACCEPTED}
                                      >
                                        Đi học
                                      </SelectItem>
                                      <SelectItem
                                        value={StudyStateEnum.PENDING}
                                      >
                                        Bảo lưu
                                      </SelectItem>
                                      <SelectItem
                                        value={StudyStateEnum.REJECTED}
                                      >
                                        Bỏ học
                                      </SelectItem>
                                      <SelectItem value={StudyStateEnum.NOTYET}>
                                        Chưa đi học
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="nation"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">Quốc gia</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field?.value ?? ''}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn quốc gia" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={NationEnum.VIETNAM}>
                                        Việt Nam
                                      </SelectItem>
                                      <SelectItem value={NationEnum.OTHER}>
                                        Khác
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="nationality"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Quốc tịch
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Quốc tịch" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={NationEnum.VIETNAM}>
                                        Việt Nam
                                      </SelectItem>
                                      <SelectItem value={NationEnum.OTHER}>
                                        Khác
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-07-chunk-1">
                      <CardHeader>
                        <CardTitle>Quan hệ gia đình</CardTitle>
                        <CardDescription>
                          Thông tin về gia đình của sinh viên
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-6">
                        <div className="grid gap-6">
                          <FormField
                            control={studentInfoForm.control}
                            name="father_name"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel>Họ và tên cha</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Họ và tên cha"
                                    type="text"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentInfoForm.control}
                            name="father_date_of_birth"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel>Ngày sinh (Cha)</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value &&
                                            'text-muted-foreground',
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, 'dd/MM/yyyy')
                                        ) : (
                                          <span>Chọn ngày sinh</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date('1900-01-01')
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-6">
                          <FormField
                            control={studentInfoForm.control}
                            name="mother_name"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel>Họ và tên mẹ</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Họ và tên mẹ"
                                    type="text"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentInfoForm.control}
                            name="mother_date_of_birth"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel>Ngày sinh (Mẹ)</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value &&
                                            'text-muted-foreground',
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, 'dd/MM/yyyy')
                                        ) : (
                                          <span>Chọn ngày sinh</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date('1900-01-01')
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-07-chunk-2">
                      <CardHeader>
                        <CardTitle>Kết quả học tập THPT</CardTitle>
                        <CardDescription>
                          Kết quả Trung học phổ thông của sinh viên
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="study_rank"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Xếp loại học tập
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Xếp loại học tập" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={RankEnum.TOT}>
                                        Tốt
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KHA}>
                                        Khá
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KEM}>
                                        Kém
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="morality_rank"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Xếp loại hạnh kiểm
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Xếp loại hạnh kiểm" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={RankEnum.TOT}>
                                        Tốt
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KHA}>
                                        Khá
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KEM}>
                                        Kém
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="graduate_rank"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Xếp loại tốt nghiệp
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Xếp loại tốt nghiệp" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={RankEnum.TOT}>
                                        Tốt
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KHA}>
                                        Khá
                                      </SelectItem>
                                      <SelectItem value={RankEnum.KEM}>
                                        Kém
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="graduate_year"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Năm tốt nghiệp</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      placeholder="Năm tốt nghiệp"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card x-chunk="dashboard-07-chunk-3">
                      <CardHeader>
                        <CardTitle>Thông tin ngành học</CardTitle>
                        <CardDescription>
                          Thông tin ngành học của sinh viên
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6">
                          <FormField
                            control={studentInfoForm.control}
                            name="hdt"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel htmlFor="text">Hệ đào tạo</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn hệ đào tạo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={HDTEnum.DAIHOC}>
                                      Đại học
                                    </SelectItem>
                                    <SelectItem value={HDTEnum.CAODANG}>
                                      Cao đẳng
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentInfoForm.control}
                            name="main_majors"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel htmlFor="text">
                                  Chuyên ngành chính
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={studentData.main_majors}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          studentData.mmr?.name ??
                                          'Chọn chuyên ngành chính'
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {majorsSelect.map((item: Majors) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentInfoForm.control}
                            name="extra_majors"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel htmlFor="text">
                                  Chuyên ngành thứ 2
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          studentData.emr?.name ??
                                          'Chọn chuyên ngành thứ 2'
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {majorsSelect.map((item: Majors) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentInfoForm.control}
                            name="class_id"
                            render={({ field }) => (
                              <FormItem className="grid">
                                <FormLabel htmlFor="text">Lớp học</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={studentData.class_id ?? ''}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          studentData.classes?.name ??
                                          'Chọn lớp học'
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {classSelect.map((item: Class) => (
                                      <SelectItem key={item.id} value={item.id}>
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
                      </CardContent>
                    </Card>
                    <Card
                      className="overflow-hidden"
                      x-chunk="dashboard-07-chunk-4"
                    >
                      <CardHeader>
                        <CardTitle>Kết quả tuyển sinh</CardTitle>
                        <CardDescription>
                          Thông tin, kết quả tuyển sinh của sinh viên nhập
                          trường.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 w-full my-5">
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="sbd"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Số báo danh</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Số báo danh"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="block"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Khối thi</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      placeholder="Khối thi"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="admissions_industry"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel htmlFor="text">
                                    Ngành tuyển sinh
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={
                                      studentData.admissions_industry ?? ''
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={
                                            studentData.aimr?.name ??
                                            'Chọn ngành tuyển sinh'
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {majorsSelect.map((item: Majors) => (
                                        <SelectItem
                                          key={item.id}
                                          value={item.id}
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
                            <FormField
                              control={studentInfoForm.control}
                              name="area"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Khu vực</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(e, 'area', field)
                                      }
                                      placeholder="Khu vực"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="count"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Lần thi</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Lần thi"
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(e, 'count', field)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-6">
                            <FormField
                              control={studentInfoForm.control}
                              name="suj_score_1"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Điểm môn 1</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Điểm môn 2"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(
                                          e,
                                          'suj_score_1',
                                          field,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="suj_score_2"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Điểm môn 2</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Điểm môn 2"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(
                                          e,
                                          'suj_score_2',
                                          field,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="suj_score_3"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Điểm môn 3</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Điểm môn 3"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(
                                          e,
                                          'suj_score_3',
                                          field,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="plus_score"
                              render={({ field }) => (
                                <FormItem className="grid">
                                  <FormLabel>Điểm cộng</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Điểm cộng"
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        numberInputChange(
                                          e,
                                          'plus_score',
                                          field,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentInfoForm.control}
                              name="total_score"
                              render={({ field }) => {
                                // Return
                                return (
                                  <FormItem className="grid">
                                    <FormLabel>Điểm tổng</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Điểm tổng"
                                        type="number"
                                        disabled
                                        {...field}
                                        value={
                                          studentInfoForm.getValues()
                                            .suj_score_1 +
                                          studentInfoForm.getValues()
                                            .suj_score_2 +
                                          studentInfoForm.getValues()
                                            .suj_score_3 +
                                          studentInfoForm.getValues().plus_score
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="spac">
          <div className="grid flex-1 auto-rows-max gap-4">
            <Card x-chunk="dashboard-07-chunk-1" className="overflow-x-auto">
              <CardHeader>
                <div className="flex justify-between">
                  <div className="space-y-1.5">
                    <CardTitle>Chứng chỉ, giấy tờ</CardTitle>
                    <CardDescription>
                      Các chứng chỉ, giấy tờ của sinh viên và thông tin trạng
                      thái
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <AlertDialog
                      onOpenChange={setDeleteRowDilog}
                      open={deleteRowDilog}
                    >
                      <AlertDialogTrigger asChild>
                        {rowSelection &&
                          Object.keys(rowSelection).length > 0 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Xoá giấy tờ
                              </span>
                            </Button>
                          )}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc muốn xoá các giấy tờ đã chọn?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Khi đồng ý sẽ xoá các giấy tờ đã chọn trong bảng.
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1"
                        >
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
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-7"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Thêm chứng chỉ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <Form {...spacForm}>
                          <form onSubmit={spacForm.handleSubmit(onInsertSpac)}>
                            <DialogHeader>
                              <DialogTitle>Thêm chứng chỉ</DialogTitle>
                              <DialogDescription>
                                Thêm chứng chỉ vào danh sách giấy tờ nhập trường
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid">
                                <FormField
                                  control={spacForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel htmlFor="text">
                                        Tên chứng chỉ
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Tên chứng chỉ"
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
                                  control={spacForm.control}
                                  name="submit_note"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel htmlFor="text">
                                        Ghi chú nộp
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Ghi chú nộp"
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
                                  control={spacForm.control}
                                  name="give_back_note"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel htmlFor="text">
                                        Ghi chú trả
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Ghi chú trả"
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
                                  control={spacForm.control}
                                  name="give_back_date"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel>Ngày trả</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant={'outline'}
                                              className={cn(
                                                'w-full pl-3 text-left font-normal',
                                                !field.value &&
                                                  'text-muted-foreground',
                                              )}
                                            >
                                              {field.value ? (
                                                format(
                                                  field.value,
                                                  'dd/MM/yyyy',
                                                )
                                              ) : (
                                                <span>Chọn ngày trả</span>
                                              )}
                                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-auto p-0"
                                          align="start"
                                        >
                                          <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                              date > new Date() ||
                                              date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid">
                                <FormField
                                  control={spacForm.control}
                                  name="file"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel htmlFor="text">
                                        Chọn file PDF
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="file"
                                          accept="application/pdf"
                                          placeholder="Chọn file PDF"
                                          {...fileRef}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="flex">
                                <FormField
                                  control={spacForm.control}
                                  name="give_back"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-y-0 gap-3">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel>Đã trả lại</FormLabel>
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
                    <Dialog open={openMulSpac} onOpenChange={setOpenMulSpac}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-7"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Thêm nhiều chứng chỉ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <Form {...mulSpacForm}>
                          <form
                            onSubmit={mulSpacForm.handleSubmit(onInsertMulSpac)}
                          >
                            <DialogHeader>
                              <DialogTitle>Thêm các tệp chứng chỉ</DialogTitle>
                              <DialogDescription>
                                Thêm tệp chứng chỉ vào danh sách giấy tờ nhập
                                trường
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid">
                                <FormField
                                  control={mulSpacForm.control}
                                  name="files"
                                  render={({ field }) => (
                                    <FormItem className="grid">
                                      <FormLabel htmlFor="text">
                                        Chọn các file PDF
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="file"
                                          accept="application/pdf"
                                          placeholder="Chọn file PDF"
                                          {...filesRef}
                                          multiple
                                        />
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
                      spac?.length > 0 && table.getRowModel().rows?.length ? (
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
                                style={{
                                  ...getCommonPinningStyles(cell.column),
                                }}
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
                    {pageConfig ? 10 * (page - 1) + spac.length : 0}
                  </strong>{' '}
                  trên <strong>{pageConfig ? pageConfig?.total : 0}</strong>{' '}
                  ngành học
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
