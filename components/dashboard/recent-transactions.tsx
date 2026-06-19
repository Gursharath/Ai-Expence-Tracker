const transactions = [
    {
        id: 1,
        name: "Starbucks",
        amount: "-$12",
        category: "Food",
    },
    {
        id: 2,
        name: "Netflix",
        amount: "-$15",
        category: "Entertainment",
    },
    {
        id: 3,
        name: "Salary",
        amount: "+$2500",
        category: "Income",
    },
]

export default function RecentTransactions() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    Recent Transactions
                </h2>
            </div>

            <div className="space-y-4">
                {transactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b pb-4"
                    >
                        <div>
                            <p className="font-medium">
                                {transaction.name}
                            </p>

                            <p className="text-sm text-zinc-500">
                                {transaction.category}
                            </p>
                        </div>

                        <p className="font-semibold">
                            {transaction.amount}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}