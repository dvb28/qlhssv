'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { signIn, SignInResponse } from 'next-auth/react';
import { useRouter } from 'next-nprogress-bar';

type Props = {};

// Form Schema
const formSchema = z.object({
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
});

export default function Login({}: Props) {
  // Router
  const router = useRouter();

  // SearchParams
  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Promise
    const promise = () =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Fetcher
          const signInResult: SignInResponse | undefined = await signIn(
            'credentials',
            {
              email: values.email,
              password: values.password,
              redirect: false,
              callbackUrl: searchParams?.get('callbackUrl') || '/',
            },
          );

          // Sign in
          !signInResult?.ok || signInResult?.error
            ? reject(signInResult?.error)
            : resolve(signInResult?.ok);
        }, 2000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang đăng nhập, vui lòng đợi...',
      success: () => {
        // Route to login
        router.push('/admin/dashboard');

        // Show message
        return 'Đăng nhập thành công';
      },
      error: (message: string) => `${message}`,
    });
  }

  // Return
  return (
    <div className="flex items-center min-h-screen justify-center p-9">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để đăng nhập.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
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
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <Label htmlFor="password">Mật khẩu</Label>
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
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Quên mật khẩu?
              </Link>
              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Bạn chưa có tài khoản?{' '}
            <Link href="/auth/register" className="underline">
              Đăng ký
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
