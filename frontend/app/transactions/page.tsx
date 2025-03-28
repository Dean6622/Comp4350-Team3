"use client";

/**
 * Transactions page
 */
import { useState, useEffect } from "react";
import { useTransactions } from "@/app/contexts/TransactionsContext";
import { Transaction } from "../api/transac";
import { useAuth } from "@/app/contexts/AuthContext";

// components
import Layout from "@/components/ui/Layout";
import TransactionList from "@/components/ui/Transaction/TransactionList";
import { FloatingButton, FilterButton } from "@/components/ui/Button";
import TransactionFormModal from "@/components/ui/Transaction/TransactionFormModal";
import { SearchBar } from "@/components/ui/Input";

export default function TransactionsPage() {
    const { transactions, getTransactions } = useTransactions();
    const { user } = useAuth();
    const [data, setData] = useState<Transaction[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(
        null
    );
    const CategoryList = ["CAD", "USD"];
    const searchHint = "Search Transaction";

    // change the transactions displayed on the fly when search term is changing
    const onSearchTermChange = (searchTerm: string) => {
        setData(
            transactions.filter((transaction) =>
                transaction.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        );
    };

    const onSelectCategory = (items: string[]) => {
        setData(
            items.length > 0
                ? transactions.filter((transaction) =>
                      items.some((i) =>
                          transaction.currency
                              .toLowerCase()
                              .includes(i.toLowerCase())
                      )
                  )
                : transactions
        );
    };

    const getDataOnRender = async () => {
        try {
            const success = await getTransactions(
                user?.id || (localStorage.getItem("userid") as string)
            );
            if (success) {
                setData(transactions);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Transactions fetch failed!");
            }
        }
    };

    useEffect(() => {
        getDataOnRender();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        setData(transactions);
    }, [transactions]);

    // **OPEN MODAL FOR ADDING**
    const openAddModal = () => {
        setEditTransaction(null);
        setIsFormOpen(true);
    };

    // **OPEN MODAL FOR EDITING**
    const openEditModal = (transaction: Transaction) => {
        setEditTransaction(transaction);
        setIsFormOpen(true);
    };

    // **CLOSE MODAL**
    const closeModal = () => {
        setIsFormOpen(false);
        setEditTransaction(null);
    };

    const middleComponent = (
        <div className="flex-1 flex justify-center">
            <SearchBar
                searchHint={searchHint || ""}
                onTextChange={onSearchTermChange}
            />
            <FilterButton
                filterName="Category"
                filterOptions={CategoryList}
                onSelectOption={onSelectCategory}
            />
        </div>
    );

    // const onSelectCurrency = (item: string) => {
    //     console.log(item);
    // };
    //
    // const rightComponent = () => {
    //     return (
    //         <details className="dropdown">
    //             <summary className="btn m-1">{"Currency"}</summary>
    //             <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    //                 {currencyList.map((d) => {
    //                     return (
    //                         <li key={d}>
    //                             <a onClick={() => onSelectCurrency(d)}>{d}</a>
    //                         </li>
    //                     );
    //                 })}
    //             </ul>
    //         </details>
    //     );
    // };

    return (
        <Layout title="Transactions" middleComponent={middleComponent}>
            {/* Transactions List */}
            <TransactionList transactions={data} onEdit={openEditModal} />

            {/* Floating + button */}
            <FloatingButton toggle={openAddModal} />

            {/* Transaction Form Modal */}
            <TransactionFormModal
                isOpen={isFormOpen}
                toggle={closeModal}
                refreshTransactions={getDataOnRender}
                mode={editTransaction ? "edit" : "add"}
                existingTransaction={editTransaction}
            />
        </Layout>
    );
}
