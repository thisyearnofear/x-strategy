/*
 * Envio Event Handlers
 */
import {
    XStrategyFactory,
    XStrategy,
} from "generated";

// Dynamic Contract Registration
XStrategyFactory.StrategyCreated.contractRegister(({ event, context }) => {
    context.addXStrategy(event.params.strategy);
});

XStrategyFactory.StrategyCreated.handler(async ({ event, context }) => {
    const strategyId = event.params.strategy; // Address string

    // Initialize Strategy Entity
    context.Strategy.set({
        id: strategyId,
        address: event.params.strategy,
        creator: event.params.strategyCreator,
        designatedCreator: event.params.designatedCreator,
        token: event.params.token,
        targetAmount: event.params.targetAmount,
        deadline: event.params.deadline,
        status: "PENDING_CREATOR", // Initial state
        currentAmountETH: 0n,
        tokensHeld: 0n,
        creatorStake: 0n,
        createdAt: BigInt(event.block.timestamp),
        completedAt: undefined,
        success: undefined
    });
});

XStrategyFactory.CreatorReputationUpdated.handler(async ({ event, context }) => {
    const creatorId = event.params.creator;
    const creator = await context.Creator.get(creatorId);

    context.Creator.set({
        id: creatorId,
        address: event.params.creator,
        reputationScore: event.params.newScore,
        strategiesCreatedCount: creator?.strategiesCreatedCount || 0n,
        strategiesCompletedCount: creator?.strategiesCompletedCount || 0n
    });
});

XStrategy.CreatorOptedIn.handler(async ({ event, context }) => {
    const strategyId = event.srcAddress;
    const strategy = await context.Strategy.get(strategyId);

    if (strategy) {
        context.Strategy.set({
            ...strategy,
            status: "ACTIVE",
            creatorStake: event.params.stakeAmount
        });
    }
});

XStrategy.ContributionConfirmed.handler(async ({ event, context }) => {
    const strategyId = event.srcAddress;
    const strategy = await context.Strategy.get(strategyId);
    // Use transaction.hash from updated config
    const contributionId = `${strategyId}-${event.transaction.hash}-${event.logIndex}`;

    // Create Contribution
    context.Contribution.set({
        id: contributionId,
        strategy_id: strategyId, // FIXED: Foreign key field name
        contributor: event.params.contributor,
        amountETH: event.params.ethAmount,
        tokensReceived: event.params.tokensReceived,
        timestamp: BigInt(event.block.timestamp),
        txHash: event.transaction.hash
    });

    // Update Strategy Totals
    if (strategy) {
        context.Strategy.set({
            ...strategy,
            currentAmountETH: strategy.currentAmountETH + event.params.ethAmount,
            tokensHeld: strategy.tokensHeld + event.params.tokensReceived
        });
    }
});

XStrategy.StrategyCompleted.handler(async ({ event, context }) => {
    const strategyId = event.srcAddress;
    const strategy = await context.Strategy.get(strategyId);

    if (strategy) {
        context.Strategy.set({
            ...strategy,
            status: event.params.success ? "COMPLETED_SUCCESS" : "COMPLETED_FAILURE",
            completedAt: BigInt(event.block.timestamp),
            success: event.params.success
        });
    }
});
