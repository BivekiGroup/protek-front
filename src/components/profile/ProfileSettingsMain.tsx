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
  const [phoneError, setPhoneError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");

  const { data, loading, error, refetch } = useQuery(GET_CLIENT_ME, {
    onCompleted: (result) => {
      const client: ClientData | undefined = result?.clientMe;
      if (!client) {
        return;
      }

      const nameParts = client.name?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(client.phone || '');
      setEmail(client.email || '');
    },
    onError: (err) => {
      console.error('Ошибка загрузки данных клиента:', err);
    }
  });

  const [updatePersonalData] = useMutation(UPDATE_CLIENT_PERSONAL_DATA, {
    onCompleted: () => {
      toast.success('Личные данные сохранены');
      refetch();
    },
    onError: (err) => {
      console.error('Ошибка обновления личных данных:', err);
      toast.error('Ошибка сохранения личных данных');
    }
  });

  const handleSavePersonalData = async () => {
    try {
      setPhoneError('');
      setEmailError('');

      if (!phone || phone.replace(/\D/g, '').length < 10) {
        setPhoneError('Введите корректный номер телефона');
        return;
      }

      if (!email || !email.includes('@')) {
        setEmailError('Введите корректный email');
        return;
      }

      await updatePersonalData({
        variables: {
          input: {
            type: 'INDIVIDUAL',
            name: `${firstName} ${lastName}`.trim(),
            phone,
            email,
            emailNotifications: false,
            smsNotifications: false,
            pushNotifications: false
          }
        }
      });
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
        phoneError={phoneError}
        emailError={emailError}
        onSave={handleSavePersonalData}
      />
    </div>
  );
};

export default ProfileSettingsMain;
