'use client';
import { CalendarIcon, ChevronLeft, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
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
import { fetcher } from '@/common/utils/fetcher';
import Class from '@/common/interface/Class';
import { useRouter } from 'next-nprogress-bar';

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
  religion: z.string({
    required_error: 'Tôn giáo không được trống.',
  }),
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
    .length(10, {
      message: 'Định dạng số điện thoại không đúng.',
    }),
  nationality: z.enum([NationEnum.VIETNAM, NationEnum.OTHER], {
    required_error: 'Trường này không được trống.',
  }),
  nation: z.enum([NationEnum.VIETNAM, NationEnum.OTHER], {
    required_error: 'Trường này không được trống.',
  }),
  date_of_birth: z.date({
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
    [StudyStateEnum.ACCEPTED, StudyStateEnum.PENDING, StudyStateEnum.REJECTED],
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
  class_id: z.string({
    required_error: 'Trường này không được trống.',
  }),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  mother_date_of_birth: z.any(),
  father_date_of_birth: z.any(),
  sbd: z.string({
    required_error: 'Trường này không được trống.',
  }),
  block: z.string({
    required_error: 'Trường này không được trống.',
  }),
  admissions_industry: z.string({
    required_error: 'Trường này không được trống.',
  }),
  area: z.number({
    required_error: 'Trường này không được trống.',
  }),
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
  study_rank: z.enum([RankEnum.TOT, RankEnum.KEM, RankEnum.KHA], {
    required_error: 'Trường này không được trống.',
  }),
  morality_rank: z.enum([RankEnum.TOT, RankEnum.KEM, RankEnum.KHA], {
    required_error: 'Trường này không được trống.',
  }),
  graduate_rank: z.enum([RankEnum.TOT, RankEnum.KEM, RankEnum.KHA], {
    required_error: 'Trường này không được trống.',
  }),
  graduate_year: z
    .number({
      required_error: 'Trường này không được trống.',
    })
    .min(1900, {
      message: 'Định dạng năm không đúng.',
    })
    .max(new Date().getFullYear(), {
      message: 'Định dạng năm không đúng.',
    }),
});

export default function StudentAdd() {
  // Router
  const navigate = useRouter();

  // Majors select data
  const [majorsSelect, setMajorsSelect] = useState<Majors[]>([]);

  // Class select data
  const [classSelect, setClasssSelect] = useState<Class[]>([]);

  // 1. Define your studentInfoForm.
  const studentInfoForm = useForm<z.infer<typeof studentInfoSchema>>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: {
      email: '',
      religion: 'Không',
      suj_score_1: 0,
      suj_score_2: 0,
      suj_score_3: 0,
      plus_score: 0,
      total_score: 0,
      area: 1,
      count: 1,
    },
  });

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

  function onSubmit(values: z.infer<typeof studentInfoSchema>) {
    // Promise
    const promise = () =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Resolve
          const created = await fetcher({
            method: 'POST',
            url: '/students',
            payload: values,
          });

          // Check success and resolve
          created?.ok ? resolve(created?.data) : reject(created?.message);
        }, 2000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang tạo hồ sơ sinh viên, vui lòng đợi...',
      success: () => {
        // Show message
        return 'Tạo hồ sơ sinh viên thành công';
      },
      error: (message: string) => `${message}`,
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

  // Return
  return (
    <main className="w-full grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...studentInfoForm}>
        <form onSubmit={studentInfoForm.handleSubmit(onSubmit)}>
          <div className="grid flex-1 auto-rows-max gap-4">
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
                Tạo hồ sơ sinh viên
              </h1>
              <Badge variant="outline" className="ml-auto sm:ml-0">
                EAUT
              </Badge>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button size="sm" className="h-7 gap-1" type="submit">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Tạo hồ sơ sinh viên
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
                                <Input
                                  placeholder="Tôn giáo"
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
                                        !field.value && 'text-muted-foreground',
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
                          name="nationality"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Quốc tịch</FormLabel>
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
                        <FormField
                          control={studentInfoForm.control}
                          name="nation"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Quốc gia</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Quốc gia" />
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
                          name="state"
                          render={({ field }) => (
                            <FormItem className="grid">
                              <FormLabel htmlFor="text">Trạng thái</FormLabel>
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
                                  <SelectItem value={StudyStateEnum.ACCEPTED}>
                                    Đi học
                                  </SelectItem>
                                  <SelectItem value={StudyStateEnum.PENDING}>
                                    Bảo lưu
                                  </SelectItem>
                                  <SelectItem value={StudyStateEnum.REJECTED}>
                                    Bỏ học
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
                                      !field.value && 'text-muted-foreground',
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
                                      !field.value && 'text-muted-foreground',
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
                                  type="number"
                                  placeholder="Năm tốt nghiệp"
                                  {...field}
                                  onChange={(e) =>
                                    numberInputChange(e, 'graduate_year', field)
                                  }
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn chuyên ngành chính" />
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
                                  <SelectValue placeholder="Chọn chuyên ngành thứ 2" />
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn lớp học" />
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
                      Thông tin, kết quả tuyển sinh của sinh viên nhập trường.
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
                                <Input placeholder="Số báo danh" {...field} />
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
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ngành tuyển sinh" />
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
                                    numberInputChange(e, 'suj_score_1', field)
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
                                    numberInputChange(e, 'suj_score_2', field)
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
                                    numberInputChange(e, 'suj_score_3', field)
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
                                    numberInputChange(e, 'plus_score', field)
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
                                      studentInfoForm.getValues().suj_score_1 +
                                      studentInfoForm.getValues().suj_score_2 +
                                      studentInfoForm.getValues().suj_score_3 +
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
    </main>
  );
}
