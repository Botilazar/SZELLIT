// src/pages/TermsCond-PrivPol-Contact/PrivacyPolicy.tsx

import React from "react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{t("privacy.title")}</h1>

      <p>{t("privacy.intro")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("privacy.dataCollection")}
      </h2>
      <p>{t("privacy.dataUse")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("privacy.dataStorage")}
      </h2>
      <ul className="list-disc ml-6 mt-2">
        <li>{t("privacy.section3.list.accountInfo")}</li>
        <li>{t("privacy.section3.list.usageData")}</li>
        <li>{t("privacy.section3.list.deviceData")}</li>
      </ul>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("privacy.section4.title")}
      </h2>
      <p>{t("privacy.section4.text")}</p>

      <p className="mt-8 text-sm text-gray-600">
        {t("privacy.lastUpdated", { year: new Date().getFullYear() })}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
