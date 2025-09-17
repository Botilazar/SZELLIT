import { useEffect, useState } from "react";
import { Ban, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import hasRight from "../../utils/hasRight";
import useDarkMode from "../../hooks/useDarkMode";

interface User {
    user_id: number;
    email: string;
    fname: string;
    lname: string;
    role: "ADMIN" | "STDUSER";
    is_verified: boolean;
    created_at: string;
    neptun: string;
}

interface Item {
    item_id: number;
    title: string;
    description: string;
    price: number;
    created_at: string;
    category_name: string;
    seller_name: string;
    seller_city: string;
}

type TableType = "users" | "items";

const AdminPanelPage = () => {
    const { t } = useTranslation();
    const [tableType, setTableType] = useState<TableType>("users");
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "stduser">("all");

    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const { lng } = useParams();

    // Fetch users or items
    useEffect(() => {
        let alive = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("accessToken") || "";
                let res, data;

                if (tableType === "users") {
                    res = await fetch("http://localhost:5000/api/users", {
                        headers: { Authorization: token ? `Bearer ${token}` : "" },
                    });
                    if (!res.ok) throw new Error("Failed to fetch users");
                    data = await res.json();
                    if (alive) setUsers(data);
                } else {
                    res = await fetch("http://localhost:5000/api/items", {
                        headers: { Authorization: token ? `Bearer ${token}` : "" },
                    });
                    if (!res.ok) throw new Error("Failed to fetch items");
                    data = await res.json();
                    if (alive) setItems(data);
                }

                if (alive) setLoading(false);
            } catch (err) {
                console.error(err);
                if (alive) setLoading(false);
            }
        };

        fetchData();
        return () => { alive = false; };
    }, [tableType]);

    if (loading) return <LoadingAnimation />;

    // Filter users
    const filteredUsers = users.filter(u =>
        (u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${u.fname} ${u.lname}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === "all" ? true : u.role.toLowerCase() === roleFilter)
    );

    // Filter items
    const filteredItems = items.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Table row background helper
    const rowBg = (idx: number) =>
        isDarkMode ? (idx % 2 === 0 ? "szellit-tr-even" : "szellit-tr-odd") :
            idx % 2 === 0 ? "szellit-tr-even" : "szellit-tr-odd";

    return (
        <div className={`max-w-7xl mx-auto p-8 space-y-8 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
            <h1 className="text-3xl font-bold mb-6 szellit-text">{t("adminPanel.title", "Admin Panel")}</h1>

            {/* Table Selector */}
            <div className="flex gap-4 mb-4">
                <button
                    className={`px-4 py-2 rounded-lg shadow-md ${tableType === "users" ? "szellit-thead" : "szellit-button"}`}
                    onClick={() => setTableType("users")}
                >
                    {t("adminPanel.tables.users", "Users")}
                </button>
                <button
                    className={`px-4 py-2 rounded-lg shadow-md ${tableType === "items" ? "szellit-thead" : "szellit-button"}`}
                    onClick={() => setTableType("items")}
                >
                    {t("adminPanel.tables.items", "Items")}
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between szellit-navbar p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-2 w-full md:w-1/2">
                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder={
                            tableType === "users"
                                ? t("adminPanel.search.users", "Search by name or email...")
                                : t("adminPanel.search.items", "Search by title or description...")
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="szellit-search-input"
                    />
                </div>

                {tableType === "users" && (
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "stduser")}
                        className="szellit-filter-select"
                    >
                        <option value="all">{t("adminPanel.filters.allRoles", "All Roles")}</option>
                        <option value="admin">{t("adminPanel.filters.admins", "Admins")}</option>
                        <option value="stduser">{t("adminPanel.filters.stdUsers", "Standard Users")}</option>
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="szellit-navbar overflow-hidden rounded-2xl shadow-md">
                <table className="szellit-table">
                    <thead className="szellit-thead">
                        <tr>
                            {tableType === "users" ? (
                                <>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.id", "ID")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.neptun", "Neptun")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.name", "Name")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.email", "Email")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.role", "Role")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.verified", "Verified")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.created", "Created")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.actions", "Actions")}</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.id", "ID")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.title", "Title")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.description", "Description")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.price", "Price")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.category", "Category")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.seller", "Seller")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.city", "City")}</th>
                                    <th className="px-6 py-3 font-semibold">{t("adminPanel.tableHeaders.created", "Created")}</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {tableType === "users" && filteredUsers.length > 0 ? (
                            filteredUsers.map((u, idx) => (
                                <tr
                                    key={u.user_id}
                                    className={`${rowBg(idx)} cursor-pointer table-hover transition`}
                                    onClick={() => navigate(`/${lng}/profiles/${u.user_id}`)}
                                >
                                    <td className="px-6 py-3">{u.user_id}</td>
                                    <td className="px-6 py-3">{u.neptun}</td>
                                    <td className="px-6 py-3">{u.fname} {u.lname}</td>
                                    <td className="px-6 py-3">{u.email}</td>
                                    <td className="px-6 py-3 capitalize">{u.role.toLowerCase()}</td>
                                    <td className="px-6 py-3">
                                        {u.is_verified ? (
                                            <span className="text-green-600 font-semibold">{t("adminPanel.yes", "Yes")}</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">{t("adminPanel.no", "No")}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => alert(t("adminPanel.banAlert", `Ban user ${u.email} (TODO)`))}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                                        >
                                            <Ban className="w-4 h-4" /> {t("adminPanel.ban", "Ban")}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : tableType === "items" && filteredItems.length > 0 ? (
                            filteredItems.map((i, idx) => (
                                <tr
                                    key={i.item_id}
                                    className={`${rowBg(idx)} cursor-pointer table-hover transition`}
                                    onClick={() => navigate(`/${lng}/items/${i.item_id}`)}
                                    title={i.description}
                                >
                                    <td className="px-6 py-3">{i.item_id}</td>
                                    <td className="px-6 py-3">{i.title}</td>
                                    <td className="px-6 py-3 truncate max-w-xs" title={i.description}>{i.description}</td>
                                    <td className="px-6 py-3">{i.price}</td>
                                    <td className="px-6 py-3">{i.category_name}</td>
                                    <td className="px-6 py-3">{i.seller_name}</td>
                                    <td className="px-6 py-3">{i.seller_city}</td>
                                    <td className="px-6 py-3">{new Date(i.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableType === "users" ? 8 : 8} className="px-6 py-6 text-center text-gray-500 dark:text-gray-300">
                                    {t("adminPanel.noRecords", "No records found.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats & Notes */}
            <div className="grid md:grid-cols-2 gap-6">
                {tableType === "users" ? (
                    <div className="szellit-navbar p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-semibold mb-3">{t("adminPanel.stats.userStats", "User Statistics")}</h2>
                        <p>{t("adminPanel.stats.totalUsers", "Total Users")}: {users.length}</p>
                        <p>{t("adminPanel.stats.admins", "Admins")}: {users.filter(u => u.role === "ADMIN").length}</p>
                        <p>{t("adminPanel.stats.stdUsers", "Standard Users")}: {users.filter(u => u.role === "STDUSER").length}</p>
                    </div>
                ) : (
                    <div className="szellit-navbar p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-semibold mb-3">{t("adminPanel.stats.itemStats", "Item Statistics")}</h2>
                        <p>{t("adminPanel.stats.totalItems", "Total Items")}: {items.length}</p>
                        <p>{t("adminPanel.stats.categories", "Categories")}: {Array.from(new Set(items.map(i => i.category_name))).length}</p>
                        <p>{t("adminPanel.stats.avgPrice", "Average Price")}: {items.length > 0 ? (items.reduce((acc, i) => acc + i.price, 0) / items.length).toFixed(2) : 0}</p>
                    </div>
                )}

                <div className="szellit-navbar p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-3">{t("adminPanel.notes.title", "Admin Notes")}</h2>
                    <p className="szellit-text text-sm">{t("adminPanel.notes.description", "Here you can leave internal notes, or show system alerts/logs.")}</p>
                </div>
            </div>
        </div>
    );
};

export default hasRight(AdminPanelPage, "ADMIN");
