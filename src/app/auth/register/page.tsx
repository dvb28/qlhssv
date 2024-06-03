'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Response } from '@/common/types/response.type';
import { fetcher } from '@/common/utils/fetcher';
import { GenderEnum } from '@/common/enum/gender.enum';
import { useRouter } from 'next-nprogress-bar';
import Image from 'next/image';
import { errors } from '@/common/utils/ultils';

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

export default function Register() {
  // Router
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullname: '',
      confirm: '',
      phone: '',
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Promise
    const promise = () =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetcher
          const registed: Response = await fetcher({
            method: 'POST',
            url: '/auth/register',
            payload: {
              ...values,
              avatar: '',
            },
          });

          // Check request
          registed?.ok ? resolve(registed) : reject(registed?.message);
        }, 2000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang tạo tài khoản, vui lòng đợi...',
      success: () => {
        // Route to login
        router.push('/auth/login');

        // Show message
        return 'Đăng ký tài khoản thành công';
      },
      error: (message: string[]) => errors(toast, message),
    });
  }

  // Return
  return (
    <div className="flex items-center min-h-screen justify-center p-9 flex-col">
      <div className="mb-8 flex justify-center">
        <Image src="/images/logo.png" alt="Logo" width={300} height={300} />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Hệ thống quản lý sinh viên</CardTitle>
          <CardDescription>
            Đăng ký vào hệ thống quản lý sinh viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="text">Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Họ và tên" type="text" {...field} />
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">SĐT</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="SĐT" {...field} />
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
                          <SelectItem value={GenderEnum.MALE}>Nam</SelectItem>
                          <SelectItem value={GenderEnum.FEMALE}>Nữ</SelectItem>
                          <SelectItem value={GenderEnum.OTHER}>Khác</SelectItem>
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
              <Button type="submit" className="w-full mt-2">
                Đăng ký
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Bạn đã có tài khoản?{' '}
            <Link href="/auth/login" className="underline">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
