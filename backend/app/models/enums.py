import enum


class RewardType(str, enum.Enum):
    """How a reward is managed over time."""

    STATIC = "STATIC"  # Ongoing baseline rate (no end date or far future)
    ROTATING = "ROTATING"  # Quarterly / periodic category bonuses
    PROMOTIONAL = "PROMOTIONAL"  # Limited-time issuer or merchant offers
