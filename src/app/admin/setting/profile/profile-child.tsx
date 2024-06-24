'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GenderEnum } from '@/common/enum/gender.enum';
import { FC, memo, useState } from 'react';
import { toast } from 'sonner';
import { errors } from '@/common/utils/ultils';
import { signOut } from 'next-auth/react';
import { fetcher } from '@/common/utils/fetcher';

type ChildFormProps = {
  fullname: string;
  gender: GenderEnum;
  email: string;
  id: string;
};

// Form Schema
const profileFormSchema = z
  .object({
    email: z
      .string({
        required_error: 'Trường này không được trống.',
      })
      .email({
        message: 'Email đã nhập không hợp lệ.',
      }),
    fullname: z.string().min(10, {
      message: 'Họ và tên phải tên trên 10 ký tự.',
    }),
    gender: z.string({
      required_error: 'Vui lòng chọn giới tính.',
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
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Mật khẩu không trùng khớp',
    path: ['confirm'],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ChildForm: FC<ChildFormProps> = ({
  fullname,
  gender,
  email,
  id,
}: ChildFormProps) => {
  // Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { email, fullname, gender, password: '', confirm: '' },
    mode: 'onChange',
  });

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Loading
  const [open, setOpen] = useState<boolean>(false);

  // Handle set open
  function handleOpen(open: boolean) {
    // Check open
    if (open) {
      // Values
      const values: ProfileFormValues | any = form.getValues();

      // Map and check
      const check = Object.keys(values).filter(
        (key: any) =>
          !Boolean(values?.[key]) && key !== 'password' && key !== 'confirm',
      );

      // If check
      if (check.length === 0) {
        // Set open
        setOpen(open);
      } else {
        // Show error
        toast.error('Vui lòng nhập đầy đủ thông tin');
      }
    } else {
      // Set open
      setOpen(open);

      // Reset form
      form.resetField('password');

      // Reset form
      form.resetField('confirm');
    }
  }

  function onSubmit(values: ProfileFormValues) {
    // Promise
    const promise = () =>
      new Promise(async (resolve, reject) =>
        setTimeout(async () => {
          // Resolve
          const updated = await fetcher({
            method: 'PUT',
            url: '/users/update',
            payload: { ...values, id },
          });

          console.log(updated);

          // Check success and resolve
          updated?.ok ? resolve(updated?.data) : reject(updated?.message);
        }, 2000),
      );

    // Toast
    toast.promise(promise, {
      loading: 'Đang cập nhật thông tin tài khoản, vui lòng đợi...',
      success: () => {
        // Sign out
        signOut({ callbackUrl: '/auth/login' });

        // Show message
        return 'Cập nhật thông tin tài khoản thành công, vui lòng đăng nhập lại';
      },
      error: (message: string[]) => errors(toast, message),
      finally: () => {
        // Set loading
        setIsLoading(false);

        // Set open
        setOpen(false);

        // Reset form value
        form.reset();
      },
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder="Họ và tên" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Giới tính</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vui lòng chọn giới tính " />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={GenderEnum.FEMALE}>Nữ</SelectItem>
                  <SelectItem value={GenderEnum.MALE}>Nam</SelectItem>
                  <SelectItem value={GenderEnum.OTHER}>Khác</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Dialog open={open} onOpenChange={handleOpen}>
          <DialogTrigger asChild>
            <Button>
              Cập nhật thông tin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bạn muốn cập nhật thông tin?</DialogTitle>
              <DialogDescription>
                Sau khi cập nhật thông tin, hệ thống sẽ tự động đăng xuất.
              </DialogDescription>
              <div className="grid gap-4 py-4">
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
                      <FormDescription>
                        Vui lòng nhập mật khẩu để xác thực tài khoản
                      </FormDescription>
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
            </DialogHeader>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
};

export default memo(ChildForm);
