package com.CodeWithRishu.SnapBuy.entity;

import com.CodeWithRishu.SnapBuy.dto.Provider;
import com.CodeWithRishu.SnapBuy.dto.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.SoftDelete;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert
@DynamicUpdate
@SoftDelete
public class User extends AuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private int id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Lob
    private byte[] profileImage;

    @Transient
    private String adminKey;

    @Enumerated(EnumType.STRING)
    @JsonIgnore
    private Provider provider = Provider.LOCAL;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Set<Role> roles = Set.of(Role.USER);

    @Embedded
    private Address userAddress;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders;

    @Version
    @JsonIgnore
    private Integer version;
}