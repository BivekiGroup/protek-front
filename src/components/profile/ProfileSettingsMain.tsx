import * as React from "react";
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLIENT_ME, UPDATE_CLIENT_PERSONAL_DATA } from '@/lib/graphql';
import ProfilePersonalData from "./ProfilePersonalData";

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

const ProfileSettingsMain: React.FC = () => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailNotifications, setEmailNotifications] = React.useState(false);

  // Сохраняем оригинальные значения после загрузки
  const [originalValues, setOriginalValues] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    emailNotifications: false
  });

  const { data, loading, error, refetch } = useQuery(GET_CLIENT_ME, {
    onCompleted: (result) => {
      const client: ClientData | undefined = result?.clientMe;
      if (!client) {
        return;
      }

      const nameParts = client.name?.split(' ') || [];
      const newFirstName = nameParts[0] || '';
      const newLastName = nameParts.slice(1).join(' ') || '';
      const newEmail = client.email || '';
      const newEmailNotifications = client.emailNotifications || false;

      setFirstName(newFirstName);
      setLastName(newLastName);
      setPhone(client.phone || '');
      setEmail(newEmail);
      setEmailNotifications(newEmailNotifications);

      // Сохраняем оригинальные значения
      setOriginalValues({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        emailNotifications: newEmailNotifications
      });
    },
    onError: (err) => {
      console.error('Ошибка загрузки данных клиента:', err);
    }
  });

  // Проверяем есть ли изменения
  const hasChanges =
    firstName !== originalValues.firstName ||
    lastName !== originalValues.lastName ||
    email !== originalValues.email ||
    emailNotifications !== originalValues.emailNotifications ||
    password.length > 0;

  const [updatePersonalData] = useMutation(UPDATE_CLIENT_PERSONAL_DATA, {
    onCompleted: () => {
      toast.success('Личные данные сохранены');
      // Очищаем пароль
      setPassword('');
      // Обновляем originalValues сразу после успешного сохранения
      setOriginalValues({
        firstName,
        lastName,
        email,
        emailNotifications
      });
      // Также делаем refetch для синхронизации с сервером
      refetch();
    },
    onError: (err) => {
      console.error('Ошибка обновления личных данных:', err);
      toast.error('Ошибка сохранения личных данных');
    }
  });

  const handleSavePersonalData = async () => {
    try {
      // Email и пароль необязательны
      if (email && !email.includes('@')) {
        toast.error('Введите корректный email');
        return;
      }

      // Если пароль указан, проверяем его длину
      if (password && password.length < 6) {
        toast.error('Пароль должен содержать минимум 6 символов');
        return;
      }

      const input: any = {
        type: 'INDIVIDUAL',
        name: `${firstName} ${lastName}`.trim(),
        phone,
        emailNotifications,
        smsNotifications: false,
        pushNotifications: false
      };

      // Добавляем email и password только если они указаны
      if (email) {
        input.email = email;
      }
      if (password) {
        input.password = password;
      }

      await updatePersonalData({
        variables: { input }
      });

      // Пароль очищается в onCompleted мутации
    } catch (err) {
      console.error('Ошибка сохранения личных данных:', err);
      toast.error('Ошибка сохранения данных');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8 bg-white rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <div className="mt-4 text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-8 bg-white rounded-2xl">
        <div className="text-red-600 text-center">
          <div className="text-lg font-semibold mb-2">Ошибка загрузки данных</div>
          <div className="text-sm">{error.message}</div>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 shrink justify-center basis-0 w-full max-md:max-w-full">
      <ProfilePersonalData
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
        hasChanges={hasChanges}
        onSave={handleSavePersonalData}
      />
    </div>
  );
};

export default ProfileSettingsMain;
