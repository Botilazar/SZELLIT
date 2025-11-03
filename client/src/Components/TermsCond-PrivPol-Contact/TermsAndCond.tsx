// src/pages/TermsCond-PrivPol-Contact/TermsAndConditions.tsx

import React from "react";
import { useTranslation } from "react-i18next";

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{t("terms.title")}</h1>

      <p>{t("terms.intro")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("terms.section1.title")}
      </h2>
      <p>{t("terms.section1.text")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("terms.section2.title")}
      </h2>
      <p>{t("terms.section2.text")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("terms.section3.title")}
      </h2>
      <p>{t("terms.section3.text")}</p>

      <h2 className="mt-6 text-2xl font-semibold">
        {t("terms.section4.title")}
      </h2>
      <p>{t("terms.section4.text")}</p>

      <p className="mt-8 text-sm text-gray-600">
        {t("terms.lastUpdated", { year: new Date().getFullYear() })}
      </p>
    </div>
  );
};

export default TermsAndConditions;
